import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createPublicClient, http, PublicClient } from 'viem';
import { avalancheFuji } from 'viem/chains';
import SIMPLE_STORAGE from './simple-storage.json';

@Injectable()
export class BlockchainService {
  private client: PublicClient;
  private contractAddress: `0x${string}`;

  constructor() {
    this.client = createPublicClient({
      chain: avalancheFuji,
      // Menggunakan RPC standar/biasa dari Avalanche
      transport: http('https://api.avax-test.network/ext/bc/C/rpc'),
    });

    this.contractAddress =
      '0xd11b2af1e649af768e9fa210c10677f08f9abcc0' as `0x${string}`;
  }

  async getLatestValue() {
    try {
      const value = (await this.client.readContract({
        address: this.contractAddress,
        abi: SIMPLE_STORAGE.abi,
        functionName: 'getValue',
      })) as bigint;

      return { value: value.toString() };
    } catch (error) {
      this.handleRpcError(error);
    }
  }

  async getValueUpdatedEvents(fromBlock: number, toBlock: number) {
    try {
      // VALIDASI: Penting agar tidak kena Error 503 lagi
      const range = toBlock - fromBlock;
      if (range < 0)
        throw new Error('toBlock harus lebih besar dari fromBlock');
      if (range > 2048) throw new Error('Rentang blok maksimal adalah 2048');

      const events = await this.client.getLogs({
        address: this.contractAddress,
        event: {
          type: 'event',
          name: 'ValueUpdated',
          inputs: [{ name: 'newValue', type: 'uint256', indexed: false }],
        },
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      });

      return events.map((event) => ({
        blockNumber: event.blockNumber?.toString(),
        value: event.args.newValue?.toString(),
        txHash: event.transactionHash,
      }));
    } catch (error) {
      this.handleRpcError(error);
    }
  }

  private handleRpcError(error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);
    console.error('RPC Error Log:', message);

    if (message.includes('Rentang') || message.includes('harus lebih besar')) {
      throw new InternalServerErrorException(message);
    }

    if (message.includes('timeout') || message.includes('503')) {
      throw new ServiceUnavailableException(
        'RPC sedang sibuk (Timeout/503). Coba lagi nanti.',
      );
    }

    throw new InternalServerErrorException('Gagal terhubung ke Blockchain.');
  }
}

const connectBtn = document.getElementById("connectBtn");
const statusEl = document.getElementById("status");
const addressEl = document.getElementById("address");
const networkEl = document.getElementById("network");
const balanceEl = document.getElementById("balance");
const errorEl = document.getElementById("error");

const AVALANCHE_FUJI_CHAIN_ID = "0xa869";

let isConnected = false;
let currentAddress = null;


function shortenAddress(addr) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}


function formatAvaxBalance(balanceWei) {
  const balance = parseInt(balanceWei, 16);
  return (balance / 1e18).toFixed(4);
}


function resetUI() {
  isConnected = false;
  currentAddress = null;

  statusEl.textContent = "Not Connected";
  statusEl.style.color = "white";

  addressEl.textContent = "-";
  networkEl.textContent = "-";
  balanceEl.textContent = "-";

  connectBtn.textContent = "Connect Wallet";
  connectBtn.style.background = "#e84142";
}

async function loadWalletData(address) {

  const chainId = await ethereum.request({
    method: "eth_chainId"
  });

  if (chainId === AVALANCHE_FUJI_CHAIN_ID) {
    networkEl.textContent = "Avalanche Fuji Testnet";
    statusEl.textContent = "Connected ✅";
    statusEl.style.color = "#4cd137";
  } else {
    networkEl.textContent = "Wrong Network ❌";
    statusEl.textContent = "Ganti ke Fuji!";
    statusEl.style.color = "#fbc531";
    balanceEl.textContent = "-";
    return;
  }

  const balanceWei = await ethereum.request({
    method: "eth_getBalance",
    params: [address, "latest"]
  });

  balanceEl.textContent = formatAvaxBalance(balanceWei);
}


async function handleWallet() {

  errorEl.textContent = "";

  if (!window.ethereum) {
    errorEl.textContent = "❌ Core Wallet belum terinstall!";
    return;
  }

  
  if (isConnected) {
    resetUI();
    return;
  }

  try {
    statusEl.textContent = "Connecting...";

    const accounts = await ethereum.request({
      method: "eth_requestAccounts"
    });

    currentAddress = accounts[0];
    isConnected = true;

    addressEl.textContent = shortenAddress(currentAddress);

    connectBtn.textContent = "Disconnect";
    connectBtn.style.background = "#576574";

    await loadWalletData(currentAddress);

  } catch (err) {
    errorEl.textContent = "❌ User membatalkan koneksi";
    statusEl.textContent = "Failed";
  }
}


ethereum?.on("accountsChanged", (accounts) => {
  if (accounts.length === 0) {
    resetUI();
  } else {
    currentAddress = accounts[0];
    addressEl.textContent = shortenAddress(currentAddress);
    loadWalletData(currentAddress);
  }
});


ethereum?.on("chainChanged", () => {
  location.reload();
});

connectBtn.addEventListener("click", handleWallet);

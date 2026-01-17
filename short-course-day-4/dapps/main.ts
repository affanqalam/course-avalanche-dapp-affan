import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Konfigurasi metadata Swagger
  const config = new DocumentBuilder()
    .setTitle('Simple Storage API')
    .setDescription('Nama : Affan Qalam Maulana | NIM : 241011402865')
    .setVersion('1.0')
    .addTag('simple-storage') // Mengganti 'cats' menjadi 'simple-storage'
    .build();

  // 2. Membuat dokumen Swagger
  const document = SwaggerModule.createDocument(app, config);

  // 3. Setup Swagger UI pada path /documentation
  SwaggerModule.setup('documentation', app, document, {
    swaggerOptions: {
      // Opsi ini untuk menghapus/menyembunyikan bagian "Schemas" di bawah
      defaultModelsExpandDepth: -1,
    },
  });

  // 4. Menjalankan aplikasi pada port 3000
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:3000/documentation`);
}

bootstrap().catch((error) => {
  console.error('Error starting the application', error);
  process.exit(1);
});

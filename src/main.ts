import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // NEW: Increase payload limit to 10MB to handle image uploads
  app.use(json({ limit: '10mb' }));

  await app.listen(3000);
  console.log(`Backend API is running on: http://localhost:3000`);
}
bootstrap();
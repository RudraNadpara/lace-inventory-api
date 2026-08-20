import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. ENABLE CORS: This tells the backend to accept requests from your Vercel frontend
  app.enableCors({
    origin: '*', // For production, you can replace '*' with your exact Vercel URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 2. CLOUD BINDING: Tell NestJS to use Render's dynamic port and listen to the open internet ('0.0.0.0')
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`Application is running on port: ${port}`);
}
bootstrap();
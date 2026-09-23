import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { API_PORT } from '@common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(API_PORT, '0.0.0.0');
}
bootstrap();

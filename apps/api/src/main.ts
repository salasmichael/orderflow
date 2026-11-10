import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // removes unknown properties
      forbidNonWhitelisted: true, // rejects them with an error
      transform: true,            // converts plain JSON into DTO instances
    }),
  );
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AuditModule } from './audit.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AuditModule);
  app.enableShutdownHooks();
}
bootstrap();
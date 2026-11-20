import { SQSClient } from '@aws-sdk/client-sqs';
import type { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { PG_POOL } from './postgres-order.repository';
import { ORDER_QUEUE_URL, SQS_CLIENT } from './sqs-order-event.publisher';

export const pgPoolProvider: Provider = {
  provide: PG_POOL,
  inject: [ConfigService],
  useFactory: (config: ConfigService) =>
    new Pool({ connectionString: config.getOrThrow<string>('DATABASE_URL') }),
};

export const sqsClientProvider: Provider = {
  provide: SQS_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const endpoint = config.get<string>('SQS_ENDPOINT');
    return new SQSClient({
      region: config.get<string>('AWS_REGION') ?? 'us-east-1',
      // Fake credentials only when an emulator endpoint is set
      ...(endpoint
        ? { endpoint, credentials: { accessKeyId: 'test', secretAccessKey: 'test' } }
        : {}),
    });
  },
};

export const orderQueueUrlProvider: Provider = {
  provide: ORDER_QUEUE_URL,
  inject: [ConfigService],
  useFactory: (config: ConfigService) =>
    config.getOrThrow<string>('SQS_QUEUE_URL'),
};
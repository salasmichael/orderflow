import type { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, logLevel } from 'kafkajs';

export const KAFKA_CLIENT = Symbol('KAFKA_CLIENT');
export const ORDER_EVENTS_TOPIC = 'order-events';

export const kafkaClientProvider: Provider = {
  provide: KAFKA_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService) =>
    new Kafka({
      clientId: 'orderflow',
      brokers: config.getOrThrow<string>('KAFKA_BROKERS').split(','),
      logLevel: logLevel.WARN,
    }),
};
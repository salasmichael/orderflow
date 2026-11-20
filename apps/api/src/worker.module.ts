import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConsoleNotificationSender } from './console-notification.sender';
import { NOTIFICATION_SENDER } from './notification-sender';
import { OrderCreatedHandler } from './order-created.handler';
import {
  orderQueueUrlProvider,
  pgPoolProvider,
  sqsClientProvider,
} from './infra.providers';
import { PostgresProcessedEventStore } from './postgres-processed-event.store';
import { PROCESSED_EVENT_STORE } from './processed-event.store';
import { SqsOrderCreatedConsumer } from './sqs-order-created.consumer';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [
    pgPoolProvider,
    sqsClientProvider,
    orderQueueUrlProvider,
    { provide: PROCESSED_EVENT_STORE, useClass: PostgresProcessedEventStore },
    { provide: NOTIFICATION_SENDER, useClass: ConsoleNotificationSender },
    OrderCreatedHandler,
    SqsOrderCreatedConsumer,
  ],
})
export class WorkerModule {}
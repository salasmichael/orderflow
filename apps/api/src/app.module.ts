import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { PriceCalculator } from './price-calculator';
import { BlackFridayDiscount } from './black-friday.discount';
import { Welcome10Discount } from './welcome10.discount';
import { BuyTwoGetOneFreeDiscount } from './buy-two-get-one-free.discount';
import { ORDER_REPOSITORY } from './order.repository';
import { NOTIFICATION_SENDER } from './notification-sender';
import { PG_POOL, PostgresOrderRepository } from './postgres-order.repository';
import { ConsoleNotificationSender } from './console-notification.sender';
import { OrderQueryService } from './order-query.service';
import { SQSClient } from '@aws-sdk/client-sqs';
import { ORDER_EVENT_PUBLISHER } from './order-event.publisher';
import {
  ORDER_QUEUE_URL,
  SQS_CLIENT,
  SqsOrderEventPublisher,
} from './sqs-order-event.publisher';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController, OrderController],
  providers: [
    AppService,
    OrderService,
    OrderQueryService,
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Pool({
          connectionString: config.getOrThrow<string>('DATABASE_URL'),
        }),
    },
    { provide: ORDER_REPOSITORY, useClass: PostgresOrderRepository },
    { provide: NOTIFICATION_SENDER, useClass: ConsoleNotificationSender },
    {
      provide: PriceCalculator,
      useFactory: () =>
        new PriceCalculator([
          new BlackFridayDiscount(),
          new Welcome10Discount(),
          new BuyTwoGetOneFreeDiscount(),
        ]),
    },
    {
      provide: SQS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const endpoint = config.get<string>('SQS_ENDPOINT');
        return new SQSClient({
          region: config.get<string>('AWS_REGION') ?? 'us-east-1',
          // Only when an emulator endpoint is set, use fake credentials
          ...(endpoint
            ? { endpoint, credentials: { accessKeyId: 'test', secretAccessKey: 'test' } }
            : {}),
        });
      },
    },
    {
      provide: ORDER_QUEUE_URL,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.getOrThrow<string>('SQS_QUEUE_URL'),
    },
    { provide: ORDER_EVENT_PUBLISHER, useClass: SqsOrderEventPublisher },

  ],
})
export class AppModule {}

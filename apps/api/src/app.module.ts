import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlackFridayDiscount } from './black-friday.discount';
import { BuyTwoGetOneFreeDiscount } from './buy-two-get-one-free.discount';
import {
  orderQueueUrlProvider,
  pgPoolProvider,
  sqsClientProvider,
} from './infra.providers';
import { ORDER_EVENT_PUBLISHER } from './order-event.publisher';
import { OrderController } from './order.controller';
import { OrderQueryService } from './order-query.service';
import { ORDER_REPOSITORY } from './order.repository';
import { OrderService } from './order.service';
import { PostgresOrderRepository } from './postgres-order.repository';
import { PriceCalculator } from './price-calculator';
import { SqsOrderEventPublisher } from './sqs-order-event.publisher';
import { Welcome10Discount } from './welcome10.discount';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController, OrderController],
  providers: [
    AppService,
    OrderService,
    OrderQueryService,
    pgPoolProvider,
    sqsClientProvider,
    orderQueueUrlProvider,
    { provide: ORDER_REPOSITORY, useClass: PostgresOrderRepository },
    { provide: ORDER_EVENT_PUBLISHER, useClass: SqsOrderEventPublisher },
    {
      provide: PriceCalculator,
      useFactory: () =>
        new PriceCalculator([
          new BlackFridayDiscount(),
          new Welcome10Discount(),
          new BuyTwoGetOneFreeDiscount(),
        ]),
    },
  ],
})
export class AppModule {}
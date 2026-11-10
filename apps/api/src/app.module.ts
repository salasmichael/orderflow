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

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController, OrderController],
  providers: [
    AppService,
    OrderService,
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Pool({ connectionString: config.getOrThrow<string>('DATABASE_URL') }),
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
  ],
})
export class AppModule {}
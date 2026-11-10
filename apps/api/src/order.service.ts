import { Inject, Injectable } from '@nestjs/common';
import { ORDER_REPOSITORY } from './order.repository';
import { NOTIFICATION_SENDER } from './notification-sender';
import type { NotificationSender } from './notification-sender';
import { PriceCalculator } from './price-calculator';
import type { OrderDraft } from './order.types';
import type { OrderWriter } from './order.repository';

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderWriter,
    @Inject(NOTIFICATION_SENDER)
    private readonly notifications: NotificationSender,
    private readonly calculator: PriceCalculator,
  ) {}

  async createOrder(order: OrderDraft) {
    if (order.items.length === 0) throw new Error('empty');

    const totalInCents = this.calculator.totalInCents(order);

    await this.orders.save({ email: order.email, total: totalInCents });
    await this.notifications.sendOrderCreated(order.email, totalInCents);

    return { total: totalInCents };
  }
} 
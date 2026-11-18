import { Inject, Injectable } from '@nestjs/common';
import { ORDER_REPOSITORY } from './order.repository';
import type { OrderWriter } from './order.repository';
import { NOTIFICATION_SENDER } from './notification-sender';
import type { NotificationSender } from './notification-sender';
import { ORDER_EVENT_PUBLISHER } from './order-event.publisher';
import type { OrderEventPublisher } from './order-event.publisher';
import { createOrderCreatedEvent } from './order-created.event';
import { PriceCalculator } from './price-calculator';
import type { OrderDraft } from './order.types';

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderWriter,
    @Inject(NOTIFICATION_SENDER)
    private readonly notifications: NotificationSender,
    private readonly calculator: PriceCalculator,
    @Inject(ORDER_EVENT_PUBLISHER)
    private readonly events: OrderEventPublisher,
  ) {}

  async createOrder(order: OrderDraft) {
    const totalInCents = this.calculator.totalInCents(order);

    const orderId = await this.orders.save({
      email: order.email,
      total: totalInCents,
    });

    await this.events.orderCreated(
      createOrderCreatedEvent(orderId, order.email, totalInCents),
    );
    await this.notifications.sendOrderCreated(order.email, totalInCents);

    return { total: totalInCents };
  }
}
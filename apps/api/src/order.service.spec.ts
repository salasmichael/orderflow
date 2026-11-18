import { OrderService } from './order.service';
import { PriceCalculator } from './price-calculator';
import { BlackFridayDiscount } from './black-friday.discount';
import { Welcome10Discount } from './welcome10.discount';
import { BuyTwoGetOneFreeDiscount } from './buy-two-get-one-free.discount';
import type { NotificationSender } from './notification-sender';
import type { OrderDraft } from './order.types';
import type { OrderWriter } from './order.repository';
import type { OrderEventPublisher } from './order-event.publisher';
import type { OrderCreatedEvent } from './order-created.event';

class FakeOrderRepository implements OrderWriter {
  saved: { email: string; total: number }[] = [];
  async save(order: { email: string; total: number }): Promise<number> {
    this.saved.push(order);
    return this.saved.length; // fake id: 1, 2, 3...
  }
}

class FakeOrderEventPublisher implements OrderEventPublisher {
  published: OrderCreatedEvent[] = [];
  async orderCreated(event: OrderCreatedEvent): Promise<void> {
    this.published.push(event);
  }
}

class FakeNotificationSender implements NotificationSender {
  sent: { to: string; total: number }[] = [];
  async sendOrderCreated(to: string, total: number): Promise<void> {
    this.sent.push({ to, total });
  }
}

const orderWith = (
  quantity: number,
  priceInCents: number,
  coupon?: string,
): OrderDraft => ({
  email: 'test@example.com',
  coupon,
  items: [{ productId: 'p1', priceInCents, quantity }],
});

describe('OrderService', () => {
  let repository: FakeOrderRepository;
  let notifications: FakeNotificationSender;
  let service: OrderService;
  let events: FakeOrderEventPublisher;

  beforeEach(() => {
    repository = new FakeOrderRepository();
    notifications = new FakeNotificationSender();
    const calculator = new PriceCalculator([
      new BlackFridayDiscount(),
      new Welcome10Discount(),
      new BuyTwoGetOneFreeDiscount(),
    ]);
    events = new FakeOrderEventPublisher();
    service = new OrderService(repository, notifications, calculator, events);
  });

  it('publishes an order.created event with the new order id', async () => {
    await service.createOrder(orderWith(2, 100, 'BLACKFRIDAY'));

    expect(events.published).toHaveLength(1);
    expect(events.published[0]).toMatchObject({
      type: 'order.created',
      data: { orderId: 1, email: 'test@example.com', totalInCents: 140 },
    });
  });

  it('applies the BLACKFRIDAY discount (30% off)', async () => {
    const result = await service.createOrder(orderWith(2, 100, 'BLACKFRIDAY'));
    expect(result.total).toBe(140);
  });

  it('applies the WELCOME10 discount (10% off)', async () => {
    const result = await service.createOrder(orderWith(2, 100, 'WELCOME10'));
    expect(result.total).toBe(180);
  });

  it('applies buy 2 get 1 free', async () => {
    const result = await service.createOrder(orderWith(3, 100, 'BUY2GET1'));
    expect(result.total).toBe(200);
  });

  it('charges the full price with an unknown coupon', async () => {
    const result = await service.createOrder(orderWith(2, 100, 'FAKE'));
    expect(result.total).toBe(200);
  });

  it('saves the order and notifies the customer', async () => {
    await service.createOrder(orderWith(1, 5000));
    expect(repository.saved).toEqual([
      { email: 'test@example.com', total: 5000 },
    ]);
    expect(notifications.sent).toEqual([
      { to: 'test@example.com', total: 5000 },
    ]);
  });

});

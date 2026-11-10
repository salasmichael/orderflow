import { OrderService } from './order.service';
import { PriceCalculator } from './price-calculator';
import { BlackFridayDiscount } from './black-friday.discount';
import { Welcome10Discount } from './welcome10.discount';
import { BuyTwoGetOneFreeDiscount } from './buy-two-get-one-free.discount';
import type { NotificationSender } from './notification-sender';
import type { OrderDraft } from './order.types';
import type { OrderWriter } from './order.repository';


class FakeOrderRepository implements OrderWriter {
  saved: { email: string; total: number }[] = [];
  async save(order: { email: string; total: number }): Promise<void> {
    this.saved.push(order);
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

  beforeEach(() => {
    repository = new FakeOrderRepository();
    notifications = new FakeNotificationSender();
    const calculator = new PriceCalculator([
      new BlackFridayDiscount(),
      new Welcome10Discount(),
      new BuyTwoGetOneFreeDiscount(),
    ]);
    service = new OrderService(repository, notifications, calculator);
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
    expect(repository.saved).toEqual([{ email: 'test@example.com', total: 5000 }]);
    expect(notifications.sent).toEqual([{ to: 'test@example.com', total: 5000 }]);
  });

  it('rejects an empty order and does not save anything', async () => {
    await expect(
      service.createOrder({ email: 'test@example.com', items: [] }),
    ).rejects.toThrow('empty');
    expect(repository.saved).toHaveLength(0);
    expect(notifications.sent).toHaveLength(0);
  });
});
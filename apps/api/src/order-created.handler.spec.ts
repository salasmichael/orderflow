import { OrderCreatedHandler } from './order-created.handler';
import { createOrderCreatedEvent } from './order-created.event';
import type { NotificationSender } from './notification-sender';
import type { ProcessedEventStore } from './processed-event.store';

class FakeProcessedEventStore implements ProcessedEventStore {
  private readonly claimed = new Set<string>();
  async tryClaim(eventId: string): Promise<boolean> {
    if (this.claimed.has(eventId)) return false;
    this.claimed.add(eventId);
    return true;
  }
  async release(eventId: string): Promise<void> {
    this.claimed.delete(eventId);
  }
}

class FakeNotificationSender implements NotificationSender {
  sent: { to: string; total: number }[] = [];
  failNext = false;

  async sendOrderCreated(to: string, total: number): Promise<void> {
    if (this.failNext) {
      this.failNext = false;
      throw new Error('email provider down');
    }
    this.sent.push({ to, total });
  }
}

describe('OrderCreatedHandler', () => {
  let notifications: FakeNotificationSender;
  let handler: OrderCreatedHandler;
  const event = createOrderCreatedEvent(1, 'test@example.com', 140);

  beforeEach(() => {
    notifications = new FakeNotificationSender();
    handler = new OrderCreatedHandler(new FakeProcessedEventStore(), notifications);
  });

  it('sends the notification for a new event', async () => {
    await handler.handle(event);
    expect(notifications.sent).toEqual([{ to: 'test@example.com', total: 140 }]);
  });

  it('ignores a duplicate event (idempotency)', async () => {
    await handler.handle(event);
    await handler.handle(event);
    expect(notifications.sent).toHaveLength(1);
  });

  it('releases the claim when sending fails, so a retry works', async () => {
    notifications.failNext = true;

    await expect(handler.handle(event)).rejects.toThrow('email provider down');
    expect(notifications.sent).toHaveLength(0);

    await handler.handle(event); // the retry
    expect(notifications.sent).toHaveLength(1);
  });
});
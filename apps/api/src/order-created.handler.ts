import { Inject, Injectable, Logger } from '@nestjs/common';
import { NOTIFICATION_SENDER } from './notification-sender';
import type { NotificationSender } from './notification-sender';
import type { OrderCreatedEvent } from './order-created.event';
import { PROCESSED_EVENT_STORE } from './processed-event.store';
import type { ProcessedEventStore } from './processed-event.store';

@Injectable()
export class OrderCreatedHandler {
  private readonly logger = new Logger(OrderCreatedHandler.name);

  constructor(
    @Inject(PROCESSED_EVENT_STORE)
    private readonly processed: ProcessedEventStore,
    @Inject(NOTIFICATION_SENDER)
    private readonly notifications: NotificationSender,
  ) {}

  async handle(event: OrderCreatedEvent): Promise<void> {
    const isNew = await this.processed.tryClaim(event.eventId);
    if (!isNew) {
      this.logger.warn(`Duplicate event ${event.eventId} skipped`);
      return;
    }

    try {
      await this.notifications.sendOrderCreated(
        event.data.email,
        event.data.totalInCents,
      );
    } catch (error) {
      await this.processed.release(event.eventId);
      throw error;
    }
  }
}
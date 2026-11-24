import type { OrderCreatedEvent } from './order-created.event';
import type { OrderEventPublisher } from './order-event.publisher';

export class CompositeOrderEventPublisher implements OrderEventPublisher {
  constructor(private readonly publishers: OrderEventPublisher[]) {}

  async orderCreated(event: OrderCreatedEvent): Promise<void> {
    for (const publisher of this.publishers) {
      await publisher.orderCreated(event);
    }
  }
}
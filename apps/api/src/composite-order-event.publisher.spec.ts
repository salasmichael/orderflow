import { CompositeOrderEventPublisher } from './composite-order-event.publisher';
import { createOrderCreatedEvent } from './order-created.event';
import type { OrderEventPublisher } from './order-event.publisher';

describe('CompositeOrderEventPublisher', () => {
  it('sends the event to every publisher', async () => {
    const received: string[] = [];
    const make = (name: string): OrderEventPublisher => ({
      orderCreated: async () => {
        received.push(name);
      },
    });

    const composite = new CompositeOrderEventPublisher([make('sqs'), make('kafka')]);
    await composite.orderCreated(createOrderCreatedEvent(1, 'a@b.com', 100));

    expect(received).toEqual(['sqs', 'kafka']);
  });
});
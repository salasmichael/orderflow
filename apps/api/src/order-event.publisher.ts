import type { OrderCreatedEvent } from './order-created.event';

export interface OrderEventPublisher {
  orderCreated(event: OrderCreatedEvent): Promise<void>;
}

export const ORDER_EVENT_PUBLISHER = Symbol('ORDER_EVENT_PUBLISHER');
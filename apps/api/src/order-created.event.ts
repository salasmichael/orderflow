import { randomUUID } from 'node:crypto';

export interface OrderCreatedEvent {
  eventId: string;
  type: 'order.created';
  occurredAt: string;
  data: {
    orderId: number;
    email: string;
    totalInCents: number;
  };
}

export function createOrderCreatedEvent(
  orderId: number,
  email: string,
  totalInCents: number,
): OrderCreatedEvent {
  return {
    eventId: randomUUID(),
    type: 'order.created',
    occurredAt: new Date().toISOString(),
    data: { orderId, email, totalInCents },
  };
}
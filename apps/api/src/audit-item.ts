import type { OrderCreatedEvent } from './order-created.event';

export function toAuditItem(event: OrderCreatedEvent) {
  return {
    pk: `ORDER#${event.data.orderId}`,
    sk: `EVENT#${event.occurredAt}#${event.eventId}`,
    eventId: event.eventId,
    type: event.type,
    occurredAt: event.occurredAt,
    payload: event.data,
  };
}
import { createOrderCreatedEvent } from './order-created.event';
import { toAuditItem } from './audit-item';

describe('toAuditItem', () => {
  const event = createOrderCreatedEvent(42, 'test@example.com', 140);

  it('groups events by order', () => {
    expect(toAuditItem(event).pk).toBe('ORDER#42');
  });

  it('sorts by time and is unique per event', () => {
    const item = toAuditItem(event);
    expect(item.sk).toBe(`EVENT#${event.occurredAt}#${event.eventId}`);
  });

  it('gives the same keys to the same event (idempotency)', () => {
    const a = toAuditItem(event);
    const b = toAuditItem(event);
    expect([a.pk, a.sk]).toEqual([b.pk, b.sk]);
  });

  it('gives different keys to different events of the same order', () => {
    const other = createOrderCreatedEvent(42, 'test@example.com', 140);
    expect(toAuditItem(other).sk).not.toBe(toAuditItem(event).sk);
  });
});
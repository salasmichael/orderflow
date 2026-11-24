import type { OrderCreatedEvent } from './order-created.event';

export interface AuditLog {
  /** true if recorded now, false if this exact event was already recorded */
  record(event: OrderCreatedEvent): Promise<boolean>;
}

export const AUDIT_LOG = Symbol('AUDIT_LOG');
import type { OrderDraft } from './order.types';

export interface Discount {
  /** Does this discount apply to the order? */
  appliesTo(order: OrderDraft): boolean;

  /** How many cents does it take off the subtotal? */
  amountInCents(order: OrderDraft, subtotalInCents: number): number;
}

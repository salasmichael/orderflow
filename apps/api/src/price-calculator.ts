import type { Discount } from './discount';
import type { OrderDraft } from './order.types';

export class PriceCalculator {
  constructor(private readonly discounts: Discount[]) {}

  totalInCents(order: OrderDraft): number {
    const subtotal = order.items.reduce(
      (sum, item) => sum + item.priceInCents * item.quantity,
      0,
    );

    const discount = this.discounts
      .filter((d) => d.appliesTo(order))
      .reduce((sum, d) => sum + d.amountInCents(order, subtotal), 0);

    return Math.max(subtotal - discount, 0);
  }
}

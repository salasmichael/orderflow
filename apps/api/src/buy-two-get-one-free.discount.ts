import type { Discount } from './discount';
import type { OrderDraft } from './order.types';

export class BuyTwoGetOneFreeDiscount implements Discount {
  private static readonly COUPON = 'BUY2GET1';

  appliesTo(order: OrderDraft): boolean {
    return order.coupon === BuyTwoGetOneFreeDiscount.COUPON;
  }

  amountInCents(order: OrderDraft): number {
    // For every 3 units of an item, one is free.
    return order.items.reduce((total, item) => {
      const freeUnits = Math.floor(item.quantity / 3);
      return total + freeUnits * item.priceInCents;
    }, 0);
  }
}

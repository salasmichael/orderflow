import type { Discount } from './discount';
import type { OrderDraft } from './order.types';

export class BlackFridayDiscount implements Discount {
  private static readonly COUPON = 'BLACKFRIDAY';
  private static readonly RATE = 0.3;

  appliesTo(order: OrderDraft): boolean {
    return order.coupon === BlackFridayDiscount.COUPON;
  }

  amountInCents(_order: OrderDraft, subtotalInCents: number): number {
    return Math.round(subtotalInCents * BlackFridayDiscount.RATE);
  }
}

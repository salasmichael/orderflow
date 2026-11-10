import type { Discount } from './discount';
import type { OrderDraft } from './order.types';

export class Welcome10Discount implements Discount {
  private static readonly COUPON = 'WELCOME10';
  private static readonly RATE = 0.1;

  appliesTo(order: OrderDraft): boolean {
    return order.coupon === Welcome10Discount.COUPON;
  }

  amountInCents(_order: OrderDraft, subtotalInCents: number): number {
    return Math.round(subtotalInCents * Welcome10Discount.RATE);
  }
}

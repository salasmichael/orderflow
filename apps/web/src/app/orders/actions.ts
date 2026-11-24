'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createOrder } from '@/lib/api';
import { dollarsToCents } from '@/lib/money';
import type { FormState } from './form-state';

export async function createOrderAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const priceInCents = dollarsToCents(String(formData.get('price') ?? ''));
  if (priceInCents === null) {
    return { errors: ['Price must be a number like 12.50'] };
  }

  const coupon = String(formData.get('coupon') ?? '').trim();

  const result = await createOrder({
    email: String(formData.get('email') ?? '').trim(),
    ...(coupon ? { coupon } : {}),
    items: [
      {
        productId: String(formData.get('productId') ?? '').trim(),
        priceInCents,
        quantity: Number(formData.get('quantity')),
      },
    ],
  });

  if (!result.ok) return { errors: result.errors };

  revalidatePath('/orders');
  redirect('/orders'); // redirect throws internally: never put it inside try/catch
}
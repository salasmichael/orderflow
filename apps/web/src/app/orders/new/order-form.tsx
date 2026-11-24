'use client';

import { useActionState } from 'react';
import { createOrderAction } from '../actions';
import type { FormState } from '../form-state';

const initialState: FormState = { errors: [] };

export function OrderForm() {
  const [state, formAction, pending] = useActionState(
    createOrderAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        Email
        <input name="email" type="email" required className="rounded border bg-transparent p-2" />
      </label>

      <label className="flex flex-col gap-1">
        Product id
        <input name="productId" defaultValue="p1" required className="rounded border bg-transparent p-2" />
      </label>

      <label className="flex flex-col gap-1">
        Price (USD)
        <input name="price" inputMode="decimal" placeholder="12.50" required className="rounded border bg-transparent p-2" />
      </label>

      <label className="flex flex-col gap-1">
        Quantity
        <input name="quantity" type="number" min={1} defaultValue={1} required className="rounded border bg-transparent p-2" />
      </label>

      <label className="flex flex-col gap-1">
        Coupon (optional)
        <input name="coupon" placeholder="BLACKFRIDAY" className="rounded border bg-transparent p-2" />
      </label>

      {state.errors.length > 0 && (
        <ul role="alert" className="list-disc pl-5 text-red-500">
          {state.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      <button type="submit" disabled={pending} className="rounded border px-4 py-2">
        {pending ? 'Creating...' : 'Create order'}
      </button>
    </form>
  );
}
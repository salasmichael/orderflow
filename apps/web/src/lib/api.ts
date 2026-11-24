import 'server-only';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';

export interface Order {
  id: number;
  email: string;
  total: number; // cents
}

export interface CreateOrderInput {
  email: string;
  coupon?: string;
  items: { productId: string; priceInCents: number; quantity: number }[];
}

export type CreateOrderResult =
  | { ok: true; total: number }
  | { ok: false; errors: string[] };

export async function listOrders(): Promise<Order[]> {
  const response = await fetch(`${API_URL}/orders`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`API error ${response.status}`);
  return response.json();
}

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    cache: 'no-store',
  });

  if (response.ok) {
    const body = await response.json();
    return { ok: true, total: body.total };
  }

  if (response.status === 400) {
    const body = await response.json();
    const message = body.message;
    return { ok: false, errors: Array.isArray(message) ? message : [String(message)] };
  }

  throw new Error(`API error ${response.status}`);
}
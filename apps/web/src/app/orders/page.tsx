import Link from 'next/link';
import { Suspense } from 'react';
import { listOrders } from '@/lib/api';
import { formatCents } from '@/lib/money';

export default function OrdersPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <Link href="/orders/new" className="rounded border px-4 py-2">
          New order
        </Link>
      </div>

      <Suspense fallback={<p>Loading orders...</p>}>
        <OrdersTable />
      </Suspense>
    </main>
  );
}

async function OrdersTable() {
  const orders = await listOrders();

  if (orders.length === 0) return <p>No orders yet.</p>;

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b">
          <th className="py-2">#</th>
          <th>Email</th>
          <th className="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id} className="border-b">
            <td className="py-2">{order.id}</td>
            <td>{order.email}</td>
            <td className="text-right">{formatCents(order.total)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
import { OrderForm } from './order-form';

export default function NewOrderPage() {
  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="mb-6 text-2xl font-semibold">New order</h1>
      <OrderForm />
    </main>
  );
}
'use client';

export default function OrdersError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <p className="mb-4">We could not load the orders. Is the API running?</p>
      <button onClick={reset} className="rounded border px-4 py-2">
        Try again
      </button>
    </main>
  );
}
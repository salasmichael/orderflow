import type { NewOrder, Order } from './order.types';

export interface OrderWriter {
  save(order: NewOrder): Promise<void>;
}

export interface OrderReader {
  findById(id: number): Promise<Order | null>;
}

// Kept for convenience: a class can implement both.
export interface OrderRepository extends OrderWriter, OrderReader {}

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

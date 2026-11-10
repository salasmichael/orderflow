import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import type { OrderRepository } from './order.repository';
import type { Order } from './order.types';

export const PG_POOL = Symbol('PG_POOL');

@Injectable()
export class PostgresOrderRepository implements OrderRepository, OnModuleDestroy {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async save(order: { email: string; total: number }): Promise<void> {
    await this.pool.query(
      'INSERT INTO orders (email, total_in_cents) VALUES ($1, $2)',
      [order.email, order.total],
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async findById(id: number): Promise<Order | null> {
  const result = await this.pool.query(
    'SELECT id, email, total_in_cents FROM orders WHERE id = $1',
    [id],
  );
  const row = result.rows[0];
  if (!row) return null;
  return { id: row.id, email: row.email, total: row.total_in_cents };
}
}

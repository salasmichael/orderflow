import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import type { OrderRepository } from './order.repository';
import type { NewOrder, Order } from './order.types';

export const PG_POOL = Symbol('PG_POOL');

@Injectable()
export class PostgresOrderRepository
  implements OrderRepository, OnModuleDestroy
{
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async save(order: NewOrder): Promise<number> {
    const result = await this.pool.query(
      'INSERT INTO orders (email, total_in_cents) VALUES ($1, $2) RETURNING id',
      [order.email, order.total],
    );
    return result.rows[0].id;
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

  async findRecent(limit: number): Promise<Order[]> {
    const result = await this.pool.query(
      'SELECT id, email, total_in_cents FROM orders ORDER BY id DESC LIMIT $1',
      [limit],
    );
    return result.rows.map((row) => ({
      id: row.id,
      email: row.email,
      total: row.total_in_cents,
    }));
  }

}

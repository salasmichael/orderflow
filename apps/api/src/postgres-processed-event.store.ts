import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from './postgres-order.repository';
import type { ProcessedEventStore } from './processed-event.store';

@Injectable()
export class PostgresProcessedEventStore
  implements ProcessedEventStore, OnApplicationShutdown
{
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async tryClaim(eventId: string): Promise<boolean> {
    const result = await this.pool.query(
      'INSERT INTO processed_events (event_id) VALUES ($1) ON CONFLICT (event_id) DO NOTHING',
      [eventId],
    );
    return result.rowCount === 1;
  }

  async release(eventId: string): Promise<void> {
    await this.pool.query('DELETE FROM processed_events WHERE event_id = $1', [
      eventId,
    ]);
  }

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}
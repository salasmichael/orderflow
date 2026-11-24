import { Pool } from 'pg';
import { PostgresOrderRepository } from './postgres-order.repository';

const DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgres://orderflow:orderflow@localhost:5432/orderflow';

describe('PostgresOrderRepository (integration)', () => {
  let pool: Pool;
  let repository: PostgresOrderRepository;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL });
    repository = new PostgresOrderRepository(pool);
  });

  beforeEach(async () => {
    await pool.query('TRUNCATE TABLE orders RESTART IDENTITY');
  });

  afterAll(async () => {
    await pool.end();
  });

  it('saves an order and finds it by id', async () => {
    await repository.save({ email: 'test@example.com', total: 140 });

    const found = await repository.findById(1);

    expect(found).toEqual({ id: 1, email: 'test@example.com', total: 140 });
  });

  it('returns null when the order does not exist', async () => {
    await expect(repository.findById(999)).resolves.toBeNull();
  });

  it('rejects a negative total (database constraint)', async () => {
    await expect(
      repository.save({ email: 'test@example.com', total: -1 }),
    ).rejects.toThrow();
  });

  it('lists recent orders, newest first', async () => {
    await repository.save({ email: 'a@example.com', total: 100 });
    await repository.save({ email: 'b@example.com', total: 200 });

    const orders = await repository.findRecent(10);

    expect(orders.map((o) => o.email)).toEqual(['b@example.com', 'a@example.com']);
  });

});
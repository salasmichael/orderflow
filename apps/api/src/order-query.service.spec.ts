import { NotFoundException } from '@nestjs/common';
import { OrderQueryService } from './order-query.service';
import type { OrderReader } from './order.repository';
import type { Order } from './order.types';

class FakeOrderReader implements OrderReader {
  constructor(private readonly orders: Order[]) {}

  async findById(id: number): Promise<Order | null> {
    return this.orders.find((order) => order.id === id) ?? null;
  }
}

describe('OrderQueryService', () => {
  const existing: Order = { id: 1, email: 'test@example.com', total: 140 };
  let service: OrderQueryService;

  beforeEach(() => {
    service = new OrderQueryService(new FakeOrderReader([existing]));
  });

  it('returns the order when it exists', async () => {
    await expect(service.getById(1)).resolves.toEqual(existing);
  });

  it('throws NotFoundException when it does not exist', async () => {
    await expect(service.getById(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ORDER_REPOSITORY } from './order.repository';
import type { OrderReader } from './order.repository';
import type { Order } from './order.types';

@Injectable()
export class OrderQueryService {
  constructor(@Inject(ORDER_REPOSITORY) private readonly orders: OrderReader) {}

  async getById(id: number): Promise<Order> {
    const order = await this.orders.findById(id);
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }
}

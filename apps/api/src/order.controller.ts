import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreateOrderDto } from './create-order.dto';
import { OrderQueryService } from './order-query.service';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderQueryService: OrderQueryService,
  ) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(dto);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.orderQueryService.getById(id);
  }
}

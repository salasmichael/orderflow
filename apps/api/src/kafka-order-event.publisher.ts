import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { KAFKA_CLIENT, ORDER_EVENTS_TOPIC } from './kafka.providers';
import type { OrderCreatedEvent } from './order-created.event';
import type { OrderEventPublisher } from './order-event.publisher';

@Injectable()
export class KafkaOrderEventPublisher
  implements OrderEventPublisher, OnModuleInit, OnModuleDestroy
{
  private readonly producer: Producer;

  constructor(@Inject(KAFKA_CLIENT) kafka: Kafka) {
    this.producer = kafka.producer();
  }

  async onModuleInit(): Promise<void> {
    await this.producer.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.disconnect();
  }

  async orderCreated(event: OrderCreatedEvent): Promise<void> {
    await this.producer.send({
      topic: ORDER_EVENTS_TOPIC,
      messages: [
        {
          // Same key = same partition = events of one order stay in order.
          key: String(event.data.orderId),
          value: JSON.stringify(event),
          headers: { eventType: event.type },
        },
      ],
    });
  }
}
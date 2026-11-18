import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { Inject, Injectable } from '@nestjs/common';
import type { OrderCreatedEvent } from './order-created.event';
import type { OrderEventPublisher } from './order-event.publisher';

export const SQS_CLIENT = Symbol('SQS_CLIENT');
export const ORDER_QUEUE_URL = Symbol('ORDER_QUEUE_URL');

@Injectable()
export class SqsOrderEventPublisher implements OrderEventPublisher {
  constructor(
    @Inject(SQS_CLIENT) private readonly sqs: SQSClient,
    @Inject(ORDER_QUEUE_URL) private readonly queueUrl: string,
  ) {}

  async orderCreated(event: OrderCreatedEvent): Promise<void> {
    await this.sqs.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(event),
        MessageAttributes: {
          eventType: { DataType: 'String', StringValue: event.type },
        },
      }),
    );
  }
}
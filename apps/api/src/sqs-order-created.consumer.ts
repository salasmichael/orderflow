import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import type { Message } from '@aws-sdk/client-sqs';
import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import type { OrderCreatedEvent } from './order-created.event';
import { OrderCreatedHandler } from './order-created.handler';
import { ORDER_QUEUE_URL, SQS_CLIENT } from './sqs-order-event.publisher';

@Injectable()
export class SqsOrderCreatedConsumer
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(SqsOrderCreatedConsumer.name);
  private readonly abort = new AbortController();
  private running = false;
  private loop?: Promise<void>;

  constructor(
    @Inject(SQS_CLIENT) private readonly sqs: SQSClient,
    @Inject(ORDER_QUEUE_URL) private readonly queueUrl: string,
    private readonly handler: OrderCreatedHandler,
  ) {}

  onApplicationBootstrap(): void {
    this.running = true;
    this.loop = this.poll();
  }

  async onModuleDestroy(): Promise<void> {
    this.running = false;
    this.abort.abort();
    await this.loop;
  }

  private async poll(): Promise<void> {
    this.logger.log(`Polling ${this.queueUrl}`);

    while (this.running) {
      try {
        const { Messages = [] } = await this.sqs.send(
          new ReceiveMessageCommand({
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 10,
          }),
          { abortSignal: this.abort.signal },
        );

        for (const message of Messages) {
          await this.process(message);
        }
      } catch (error) {
        if (!this.running) break;
        this.logger.error(`Polling failed: ${String(error)}`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  private async process(message: Message): Promise<void> {
    try {
      const event = JSON.parse(message.Body ?? '') as OrderCreatedEvent;
      await this.handler.handle(event);
      await this.sqs.send(
        new DeleteMessageCommand({
          QueueUrl: this.queueUrl,
          ReceiptHandle: message.ReceiptHandle,
        }),
      );
    } catch (error) {
      // Not deleted: SQS will redeliver it, and after 3 receives it goes to the DLQ.
      this.logger.warn(
        `Message ${message.MessageId} failed and will be retried: ${String(error)}`,
      );
    }
  }
}
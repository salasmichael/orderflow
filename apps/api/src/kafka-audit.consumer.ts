import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, Kafka } from 'kafkajs';
import { AUDIT_LOG } from './audit-log';
import type { AuditLog } from './audit-log';
import { KAFKA_CLIENT, ORDER_EVENTS_TOPIC } from './kafka.providers';
import type { OrderCreatedEvent } from './order-created.event';

@Injectable()
export class KafkaAuditConsumer
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(KafkaAuditConsumer.name);
  private readonly consumer: Consumer;

  constructor(
    @Inject(KAFKA_CLIENT) kafka: Kafka,
    @Inject(AUDIT_LOG) private readonly audit: AuditLog,
    config: ConfigService,
  ) {
    this.consumer = kafka.consumer({
      groupId: config.get<string>('AUDIT_GROUP_ID') ?? 'order-audit',
    });
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: ORDER_EVENTS_TOPIC,
      fromBeginning: true,
    });

    await this.consumer.run({
      eachMessage: async ({ partition, message }) => {
        const raw = message.value?.toString();
        if (!raw) return;

        let event: OrderCreatedEvent;
        try {
          event = JSON.parse(raw) as OrderCreatedEvent;
        } catch {
          this.logger.error(
            `Skipping invalid message (partition ${partition}, offset ${message.offset})`,
          );
          return;
        }

        // If this throws, the offset is NOT committed and Kafka redelivers it.
        const recorded = await this.audit.record(event);
        this.logger.log(
          recorded
            ? `Audited order ${event.data.orderId} (partition ${partition}, offset ${message.offset})`
            : `Duplicate event ${event.eventId} skipped`,
        );
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.consumer.disconnect();
  }
}
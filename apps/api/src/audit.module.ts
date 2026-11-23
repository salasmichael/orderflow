import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Module } from '@nestjs/common';
import type { Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AUDIT_LOG } from './audit-log';
import { AUDIT_TABLE, DYNAMO_CLIENT, DynamoAuditLog } from './dynamo-audit-log';
import { KafkaAuditConsumer } from './kafka-audit.consumer';
import { kafkaClientProvider } from './kafka.providers';

const dynamoClientProvider: Provider = {
  provide: DYNAMO_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const endpoint = config.get<string>('DYNAMODB_ENDPOINT');
    const client = new DynamoDBClient({
      region: config.get<string>('AWS_REGION') ?? 'us-east-1',
      // Fake credentials only when an emulator endpoint is set
      ...(endpoint
        ? { endpoint, credentials: { accessKeyId: 'test', secretAccessKey: 'test' } }
        : {}),
    });
    return DynamoDBDocumentClient.from(client);
  },
};

const auditTableProvider: Provider = {
  provide: AUDIT_TABLE,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => config.getOrThrow<string>('AUDIT_TABLE'),
};

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [
    kafkaClientProvider,
    dynamoClientProvider,
    auditTableProvider,
    { provide: AUDIT_LOG, useClass: DynamoAuditLog },
    KafkaAuditConsumer,
  ],
})
export class AuditModule {}
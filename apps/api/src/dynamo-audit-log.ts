import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { toAuditItem } from './audit-item';
import type { AuditLog } from './audit-log';
import type { OrderCreatedEvent } from './order-created.event';

export const DYNAMO_CLIENT = Symbol('DYNAMO_CLIENT');
export const AUDIT_TABLE = Symbol('AUDIT_TABLE');

@Injectable()
export class DynamoAuditLog implements AuditLog {
  constructor(
    @Inject(DYNAMO_CLIENT) private readonly db: DynamoDBDocumentClient,
    @Inject(AUDIT_TABLE) private readonly table: string,
  ) {}

  async record(event: OrderCreatedEvent): Promise<boolean> {
    try {
      await this.db.send(
        new PutCommand({
          TableName: this.table,
          Item: toAuditItem(event),
          // Fails if an item with this key already exists: a duplicate.
          ConditionExpression: 'attribute_not_exists(pk)',
        }),
      );
      return true;
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) return false;
      throw error;
    }
  }
}
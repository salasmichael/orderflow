import { Injectable, Logger } from '@nestjs/common';
import type { NotificationSender } from './notification-sender';

@Injectable()
export class ConsoleNotificationSender implements NotificationSender {
  private readonly logger = new Logger(ConsoleNotificationSender.name);

  async sendOrderCreated(to: string, total: number): Promise<void> {
    this.logger.log(
      `Email to ${to}: your total is ${(total / 100).toFixed(2)}`,
    );
  }
}

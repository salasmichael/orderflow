export interface NotificationSender {
  sendOrderCreated(to: string, total: number): Promise<void>;
}

export const NOTIFICATION_SENDER = Symbol('NOTIFICATION_SENDER');

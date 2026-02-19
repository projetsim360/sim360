export interface Notification {
  id: string;
  userId: string;
  tenantId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  readAt?: string;
  sentAt?: string;
  createdAt: string;
}

export type NotificationType = 'SYSTEM' | 'ALERT' | 'INFO' | 'ACTION_REQUIRED';
export type NotificationChannel = 'EMAIL' | 'PUSH' | 'IN_APP' | 'SMS';

export interface SendNotificationDto {
  userId: string;
  type: NotificationType;
  channels: NotificationChannel[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

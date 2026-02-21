export interface NotificationDto {
  id: string;
  eventId?: string | null;
  type: string;
  category: string;
  title: string;
  body: string;
  data?: any;
  priority: number;
  readAt?: Date | null;
  archivedAt?: Date | null;
  createdAt: Date;
}

export interface PaginatedNotificationsDto {
  data: NotificationDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UnreadCountDto {
  count: number;
}

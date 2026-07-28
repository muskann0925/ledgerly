import { NotificationType } from "@prisma/client";

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  type?: NotificationType;
  isRead?: boolean;
  search?: string;
  entityType?: string;
}

export interface PaginatedNotificationsResponse {
  notifications: any[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    unreadCount: number;
  };
}

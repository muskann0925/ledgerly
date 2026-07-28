export type NotificationType =
  | "INVOICE_SENT"
  | "INVOICE_VIEWED"
  | "PAYMENT_RECEIVED"
  | "INVOICE_OVERDUE"
  | "REMINDER_SENT"
  | "QUOTATION_APPROVED";

export interface NotificationItemData {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType: string; // "Invoice", "Payment", "Quotation"
  entityId: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  type?: NotificationType;
  isRead?: boolean;
  search?: string;
  entityType?: string;
}

export interface PaginatedNotificationsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

export interface GetNotificationsApiResponse {
  success: boolean;
  data: NotificationItemData[];
  meta: PaginatedNotificationsMeta;
}

export interface GetUnreadCountApiResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
}

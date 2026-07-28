import { notificationRepository, NotificationRepository } from "./notification.repository";
import { CreateNotificationDto, NotificationQueryParams, PaginatedNotificationsResponse } from "./notification.types";
import { NotificationType } from "@prisma/client";
import { AppError } from "../../utils/AppError";

export class NotificationService {
  constructor(private readonly repository: NotificationRepository = notificationRepository) {}

  async createNotification(data: CreateNotificationDto) {
    if (!data.userId || !data.title || !data.message || !data.type || !data.entityType || !data.entityId) {
      throw AppError.badRequest("Missing required notification fields");
    }
    return this.repository.create(data);
  }

  async createBulkNotifications(dataArray: CreateNotificationDto[]) {
    return this.repository.createBulk(dataArray);
  }

  /**
   * Helper to automatically create notifications for all active users (or specified target users)
   * when a business event occurs.
   */
  async notifyUsersForEvent(
    type: NotificationType,
    title: string,
    message: string,
    entityType: string,
    entityId: string,
    metadata?: Record<string, any>,
    targetUserIds?: string[]
  ) {
    try {
      const userIds = targetUserIds && targetUserIds.length > 0 
        ? targetUserIds 
        : await this.repository.getAllActiveUserIds();

      if (userIds.length === 0) return { count: 0 };

      const dtos: CreateNotificationDto[] = userIds.map((userId) => ({
        userId,
        type,
        title,
        message,
        entityType,
        entityId,
        metadata: metadata || {},
      }));

      return await this.repository.createBulk(dtos);
    } catch (error) {
      console.error("Failed to notify users for event:", error);
      // Non-blocking for business events
      return { count: 0 };
    }
  }

  async getNotifications(userId: string, params: NotificationQueryParams): Promise<PaginatedNotificationsResponse> {
    const { items, total, page, limit } = await this.repository.findMany(userId, params);
    const unreadCount = await this.repository.getUnreadCount(userId);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      notifications: items,
      meta: {
        total,
        page,
        limit,
        totalPages,
        unreadCount,
      },
    };
  }

  async getUnreadCount(userId: string): Promise<{ unreadCount: number }> {
    const unreadCount = await this.repository.getUnreadCount(userId);
    return { unreadCount };
  }

  async markAsRead(id: string, userId: string) {
    const result = await this.repository.markAsRead(id, userId);
    if (result.count === 0) {
      // Check if notification exists at all or belongs to another user
      const exists = await this.repository.findById(id, userId);
      if (!exists) {
        throw AppError.notFound("Notification not found");
      }
    }
    return { message: "Notification marked as read successfully" };
  }

  async markAllAsRead(userId: string) {
    await this.repository.markAllAsRead(userId);
    return { message: "All notifications marked as read successfully" };
  }

  async deleteNotification(id: string, userId: string) {
    const result = await this.repository.delete(id, userId);
    if (result.count === 0) {
      throw AppError.notFound("Notification not found or access denied");
    }
    return { message: "Notification deleted successfully" };
  }
}

export const notificationService = new NotificationService();

import { prisma } from "../../lib/prisma";
import { CreateNotificationDto, NotificationQueryParams } from "./notification.types";
import { NotificationType, Prisma } from "@prisma/client";

export class NotificationRepository {
  async create(data: CreateNotificationDto) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        entityType: data.entityType,
        entityId: data.entityId,
        metadata: data.metadata || {},
      },
    });
  }

  async createBulk(dataArray: CreateNotificationDto[]) {
    if (dataArray.length === 0) return { count: 0 };
    return prisma.notification.createMany({
      data: dataArray.map((data) => ({
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        entityType: data.entityType,
        entityId: data.entityId,
        metadata: data.metadata || {},
      })),
    });
  }

  async findMany(userId: string, params: NotificationQueryParams) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(params.type && { type: params.type }),
      ...(typeof params.isRead === "boolean" && { isRead: params.isRead }),
      ...(params.entityType && { entityType: params.entityType }),
      ...(params.search && {
        OR: [
          { title: { contains: params.search, mode: "insensitive" } },
          { message: { contains: params.search, mode: "insensitive" } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          userId: true,
          type: true,
          title: true,
          message: true,
          entityType: true,
          entityId: true,
          metadata: true,
          isRead: true,
          createdAt: true,
          readAt: true,
        },
      }),
      prisma.notification.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async findById(id: string, userId: string) {
    return prisma.notification.findFirst({
      where: { id, userId },
    });
  }

  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async delete(id: string, userId: string) {
    return prisma.notification.deleteMany({
      where: { id, userId },
    });
  }

  async existsOverdueNotification(invoiceId: string): Promise<boolean> {
    const existing = await prisma.notification.findFirst({
      where: {
        entityType: "Invoice",
        entityId: invoiceId,
        type: NotificationType.INVOICE_OVERDUE,
      },
    });
    return !!existing;
  }

  async getAllActiveUserIds(): Promise<string[]> {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    });
    return users.map((u) => u.id);
  }
}

export const notificationRepository = new NotificationRepository();

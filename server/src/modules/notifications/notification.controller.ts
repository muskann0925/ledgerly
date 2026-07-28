import { Request, Response, NextFunction } from "express";
import { notificationService, NotificationService } from "./notification.service";
import { NotificationType } from "@prisma/client";

export class NotificationController {
  constructor(private readonly service: NotificationService = notificationService) {}

  getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { page, limit, type, isRead, search, entityType } = req.query;

      const params = {
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        type: type ? (type as NotificationType) : undefined,
        isRead: isRead !== undefined ? isRead === "true" : undefined,
        search: search ? (search as string) : undefined,
        entityType: entityType ? (entityType as string) : undefined,
      };

      const result = await this.service.getNotifications(userId, params);
      res.status(200).json({
        success: true,
        data: result.notifications,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const result = await this.service.getUnreadCount(userId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      const result = await this.service.markAsRead(id, userId);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const result = await this.service.markAllAsRead(userId);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      const result = await this.service.deleteNotification(id, userId);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const notificationController = new NotificationController();

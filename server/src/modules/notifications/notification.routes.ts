import { Router } from "express";
import { notificationController } from "./notification.controller";
import { authenticate } from "../../middlewares/authenticate";

const router = Router();

// Apply authentication to all notification routes
router.use(authenticate);

// Get paginated notifications list
router.get("/", notificationController.getNotifications);

// Get unread notification count
router.get("/unread-count", notificationController.getUnreadCount);

// Mark all notifications as read
router.patch("/read-all", notificationController.markAllAsRead);

// Mark a single notification as read
router.patch("/:id/read", notificationController.markAsRead);

// Delete notification
router.delete("/:id", notificationController.deleteNotification);

export default router;

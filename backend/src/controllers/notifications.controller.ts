import { Response } from "express";
import { dbService } from "../services/db.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export const notificationsController = {
  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const notifications = await dbService.getNotifications(userId);
      const unreadCount = notifications.filter((n: any) => !n.isRead).length;

      return res.status(200).json({
        success: true,
        unreadCount,
        notifications,
      });
    } catch (error) {
      console.error("Get Notifications Error:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch notifications." });
    }
  },

  async markRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      await dbService.markNotificationRead(id, userId);

      return res.status(200).json({
        success: true,
        message: "Notification marked as read.",
      });
    } catch (error) {
      console.error("Mark Read Error:", error);
      return res.status(500).json({ success: false, error: "Failed to mark notification as read." });
    }
  },

  async markAllRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      await dbService.markAllNotificationsRead(userId);

      return res.status(200).json({
        success: true,
        message: "All notifications marked as read.",
      });
    } catch (error) {
      console.error("Mark All Read Error:", error);
      return res.status(500).json({ success: false, error: "Failed to mark all notifications as read." });
    }
  },
};

import { Response } from "express";
import { dbService } from "../services/db.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export const settingsController = {
  async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const preferences = await dbService.getNotificationPreferences(userId);

      return res.status(200).json({
        success: true,
        preferences: preferences || {
          emailNotifications: true,
          smsNotifications: false,
          jobAlerts: true,
          interviewReminders: true,
          applicationReminders: true,
          statusChangeNotifications: true,
        },
      });
    } catch (error) {
      console.error("Get Notification Settings Error:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch notification settings." });
    }
  },

  async updateNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const updated = await dbService.updateNotificationPreferences(userId, req.body);

      return res.status(200).json({
        success: true,
        message: "Notification preferences updated successfully.",
        preferences: updated,
      });
    } catch (error) {
      console.error("Update Notification Settings Error:", error);
      return res.status(500).json({ success: false, error: "Failed to update notification settings." });
    }
  },

  async getJobPreferences(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const preferences = await dbService.getJobSearchPreferences(userId);

      return res.status(200).json({
        success: true,
        preferences: preferences || {
          keywords: "",
          desiredRoles: "",
          location: "",
          jobType: "INTERNSHIP",
          isRemote: false,
        },
      });
    } catch (error) {
      console.error("Get Job Preferences Error:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch job search preferences." });
    }
  },

  async updateJobPreferences(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const updated = await dbService.updateJobSearchPreferences(userId, req.body);

      return res.status(200).json({
        success: true,
        message: "Job search preferences updated successfully.",
        preferences: updated,
      });
    } catch (error) {
      console.error("Update Job Preferences Error:", error);
      return res.status(500).json({ success: false, error: "Failed to update job search preferences." });
    }
  },
};

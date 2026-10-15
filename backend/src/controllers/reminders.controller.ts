import { Response } from "express";
import { z } from "zod";
import { dbService } from "../services/db.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const reminderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  dueDate: z.string().min(1, "Due date is required"),
  reminderType: z.enum(["FOLLOW_UP", "INTERVIEW", "DEADLINE", "CUSTOM"]).default("FOLLOW_UP"),
  applicationId: z.string().optional().nullable(),
});

export const remindersController = {
  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const reminders = await dbService.getReminders(userId);

      return res.status(200).json({
        success: true,
        count: reminders.length,
        reminders,
      });
    } catch (error) {
      console.error("Get Reminders Error:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch reminders." });
    }
  },

  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const parsed = reminderSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: parsed.error.errors[0].message,
        });
      }

      const reminder = await dbService.createReminder(userId, parsed.data);

      return res.status(201).json({
        success: true,
        message: "Reminder created successfully.",
        reminder,
      });
    } catch (error) {
      console.error("Create Reminder Error:", error);
      return res.status(500).json({ success: false, error: "Failed to create reminder." });
    }
  },

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const updated = await dbService.updateReminder(id, userId, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, error: "Reminder not found or unauthorized." });
      }

      return res.status(200).json({
        success: true,
        message: "Reminder updated.",
        reminder: updated,
      });
    } catch (error) {
      console.error("Update Reminder Error:", error);
      return res.status(500).json({ success: false, error: "Failed to update reminder." });
    }
  },

  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      await dbService.deleteReminder(id, userId);

      return res.status(200).json({
        success: true,
        message: "Reminder deleted successfully.",
      });
    } catch (error) {
      console.error("Delete Reminder Error:", error);
      return res.status(500).json({ success: false, error: "Failed to delete reminder." });
    }
  },
};

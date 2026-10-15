import { Response } from "express";
import { z } from "zod";
import { dbService } from "../services/db.service";
import { cronService } from "../services/cron.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const applicationSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position/role title is required"),
  location: z.string().optional().nullable(),
  status: z.enum(["APPLIED", "INTERVIEW", "OFFER", "REJECTED"]).default("APPLIED"),
  dateApplied: z.string().optional(),
  notes: z.string().optional().nullable(),
  jobUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")).nullable(),
  salary: z.string().optional().nullable(),
});

export const applicationsController = {
  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { status, sort, search } = req.query;

      const applications = await dbService.getApplications(userId, {
        status: status as string,
        sort: sort as string,
        search: search as string,
      });

      return res.status(200).json({
        success: true,
        count: applications.length,
        applications,
      });
    } catch (error) {
      console.error("Get Applications Error:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch applications." });
    }
  },

  async getStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const stats = await dbService.getApplicationStats(userId);

      return res.status(200).json({
        success: true,
        stats,
      });
    } catch (error) {
      console.error("Get Stats Error:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch application statistics." });
    }
  },

  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const application = await dbService.getApplicationById(id, userId);
      if (!application) {
        return res.status(404).json({ success: false, error: "Application not found." });
      }

      return res.status(200).json({
        success: true,
        application,
      });
    } catch (error) {
      console.error("Get Application By ID Error:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch application details." });
    }
  },

  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const parsed = applicationSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: parsed.error.errors[0].message,
        });
      }

      const application = await dbService.createApplication(userId, parsed.data);

      return res.status(201).json({
        success: true,
        message: "Application recorded successfully.",
        application,
      });
    } catch (error) {
      console.error("Create Application Error:", error);
      return res.status(500).json({ success: false, error: "Failed to save application." });
    }
  },

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const existing = await dbService.getApplicationById(id, userId);
      if (!existing) {
        return res.status(404).json({ success: false, error: "Application not found or unauthorized." });
      }

      const updated = await dbService.updateApplication(id, userId, req.body);

      // If status changed, trigger notification & email alert
      if (req.body.status && req.body.status !== existing.status) {
        cronService.triggerStatusChangeAlert(
          userId,
          existing.company,
          existing.position,
          req.body.status
        ).catch(console.error);
      }

      return res.status(200).json({
        success: true,
        message: "Application updated successfully.",
        application: updated,
      });
    } catch (error) {
      console.error("Update Application Error:", error);
      return res.status(500).json({ success: false, error: "Failed to update application." });
    }
  },

  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const existing = await dbService.getApplicationById(id, userId);
      if (!existing) {
        return res.status(404).json({ success: false, error: "Application not found or unauthorized." });
      }

      await dbService.deleteApplication(id, userId);

      return res.status(200).json({
        success: true,
        message: "Application deleted successfully.",
      });
    } catch (error) {
      console.error("Delete Application Error:", error);
      return res.status(500).json({ success: false, error: "Failed to delete application." });
    }
  },
};

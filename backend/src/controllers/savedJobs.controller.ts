import { Response } from "express";
import { dbService } from "../services/db.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export const savedJobsController = {
  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const savedJobs = await dbService.getSavedJobs(userId);

      return res.status(200).json({
        success: true,
        count: savedJobs.length,
        savedJobs,
      });
    } catch (error) {
      console.error("Get Saved Jobs Error:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch saved jobs." });
    }
  },

  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { jobId, notes } = req.body;

      if (!jobId) {
        return res.status(400).json({ success: false, error: "jobId is required." });
      }

      const job = await dbService.getJobById(jobId);
      if (!job) {
        return res.status(404).json({ success: false, error: "Job opportunity not found." });
      }

      const saved = await dbService.saveJob(userId, jobId, notes);

      return res.status(201).json({
        success: true,
        message: "Job saved successfully.",
        savedJob: saved,
      });
    } catch (error) {
      console.error("Save Job Error:", error);
      return res.status(500).json({ success: false, error: "Failed to save job." });
    }
  },

  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      await dbService.removeSavedJob(id, userId);

      return res.status(200).json({
        success: true,
        message: "Saved job removed successfully.",
      });
    } catch (error) {
      console.error("Remove Saved Job Error:", error);
      return res.status(500).json({ success: false, error: "Failed to remove saved job." });
    }
  },

  async convertToApplication(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params; // this can be savedJob id or jobId

      // Fetch job details
      let job = await dbService.getJobById(id);
      if (!job) {
        const savedList = await dbService.getSavedJobs(userId);
        const match = savedList.find((s: any) => s.id === id);
        if (match) {
          job = match.job;
        }
      }

      if (!job) {
        return res.status(404).json({ success: false, error: "Job not found to convert." });
      }

      // Create new application
      const application = await dbService.createApplication(userId, {
        company: job.company,
        position: job.title,
        location: job.location,
        status: "APPLIED",
        dateApplied: new Date().toISOString(),
        jobUrl: job.applicationUrl,
        notes: `Converted from saved job. Source: ${job.source}`,
      });

      return res.status(201).json({
        success: true,
        message: "Job converted into tracked application successfully!",
        application,
      });
    } catch (error) {
      console.error("Convert Job Error:", error);
      return res.status(500).json({ success: false, error: "Failed to convert job into application." });
    }
  },
};

import { Request, Response } from "express";
import { dbService } from "../services/db.service";
import { scraperService } from "../services/scraper.service";
import { jobApiService } from "../services/jobApi.service";

let lastRefreshTime = 0;
const REFRESH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

export const jobsController = {
  async getAll(req: Request, res: Response) {
    try {
      const { keyword, location, jobType, remote } = req.query;

      let isRemote: boolean | undefined = undefined;
      if (remote === "true") isRemote = true;
      if (remote === "false") isRemote = false;

      // Periodically refresh active South African opportunities from public scraper
      if (Date.now() - lastRefreshTime > REFRESH_INTERVAL_MS) {
        lastRefreshTime = Date.now();
        await dbService.upsertJobs(scraperService.getVerifiedSouthAfricanJobs());

        scraperService.scrapePublicJobBoard().then((scraped) => {
          return dbService.upsertJobs(scraped);
        }).catch((err) => {
          console.warn("Background scraper refresh error:", err);
        });
      }

      const jobs = await dbService.getJobs({
        keyword: keyword as string,
        location: location as string,
        jobType: jobType as string,
        isRemote,
      });

      return res.status(200).json({
        success: true,
        count: jobs.length,
        jobs,
      });
    } catch (error) {
      console.error("Get Jobs Error:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch job opportunities." });
    }
  },

  async search(req: Request, res: Response) {
    try {
      const { keyword, location, jobType, remote } = req.query;

      // When searching, if more than 15 minutes since last refresh or specific keyword
      if (Date.now() - lastRefreshTime > REFRESH_INTERVAL_MS) {
        lastRefreshTime = Date.now();
        const scraped = await scraperService.scrapePublicJobBoard();
        const external = await jobApiService.searchExternalJobs({
          keyword: keyword as string,
          location: location as string,
        });

        const combined = [...scraped, ...external];
        if (combined.length > 0) {
          await dbService.upsertJobs(combined);
        }
      }

      let isRemote: boolean | undefined = undefined;
      if (remote === "true") isRemote = true;
      if (remote === "false") isRemote = false;

      const results = await dbService.getJobs({
        keyword: keyword as string,
        location: location as string,
        jobType: jobType as string,
        isRemote,
      });

      return res.status(200).json({
        success: true,
        count: results.length,
        jobs: results,
      });
    } catch (error) {
      console.error("Search Jobs Error:", error);
      return res.status(500).json({ success: false, error: "Search query failed." });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const job = await dbService.getJobById(id);

      if (!job) {
        return res.status(404).json({ success: false, error: "Job opportunity not found." });
      }

      return res.status(200).json({
        success: true,
        job,
      });
    } catch (error) {
      console.error("Get Job By ID Error:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch job details." });
    }
  },
};

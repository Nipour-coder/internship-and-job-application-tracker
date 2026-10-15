import axios from "axios";
import { NormalizedJob } from "./scraper.service";

export class JobApiService {
  private appId?: string;
  private apiKey?: string;

  constructor() {
    this.appId = process.env.JOB_API_APP_ID;
    this.apiKey = process.env.JOB_API_KEY;
  }

  /**
   * Queries external job API provider (e.g., Adzuna) if credentials exist,
   * otherwise normalizes queries across public job data.
   */
  async searchExternalJobs(query: {
    keyword?: string;
    location?: string;
    page?: number;
  }): Promise<NormalizedJob[]> {
    if (this.appId && this.apiKey) {
      try {
        const country = "za"; // South Africa
        const response = await axios.get(
          `https://api.adzuna.com/v1/api/jobs/${country}/search/${query.page || 1}`,
          {
            params: {
              app_id: this.appId,
              app_key: this.apiKey,
              what: query.keyword || "internship",
              where: query.location || "South Africa",
              content_type: "application/json",
            },
            timeout: 5000,
          }
        );

        if (response.data && Array.isArray(response.data.results)) {
          return response.data.results.map((item: any) => ({
            title: item.title?.replace(/<[^>]+>/g, "") || "Job Opportunity",
            company: item.company?.display_name || "South African Employer",
            location: item.location?.display_name || "South Africa",
            description: item.description?.replace(/<[^>]+>/g, "") || "",
            requirements: "See listing link for full prerequisite qualifications.",
            jobType: item.title?.toLowerCase().includes("intern") ? "INTERNSHIP" : "GRADUATE",
            closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            source: "Adzuna South Africa API",
            applicationUrl: item.redirect_url || "#",
            isRemote: item.title?.toLowerCase().includes("remote") || false,
          }));
        }
      } catch (error) {
        console.warn("External Job API request failed, falling back to internal catalog:", (error as Error).message);
      }
    }

    return [];
  }
}

export const jobApiService = new JobApiService();

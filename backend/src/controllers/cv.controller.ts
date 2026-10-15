import { Response } from "express";
import { dbService } from "../services/db.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export const cvController = {
  async get(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      let cv = await dbService.getCV(userId);

      if (!cv) {
        const user = await dbService.findUserById(userId);
        cv = {
          userId,
          fullName: user?.fullName || "",
          email: user?.email || "",
          phone: "",
          location: "",
          summary: "",
          education: [],
          experience: [],
          skills: [],
          certifications: [],
          projects: [],
          interests: [],
        };
      }

      return res.status(200).json({
        success: true,
        cv,
      });
    } catch (error) {
      console.error("Get CV Error:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch CV data." });
    }
  },

  async save(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const cvData = req.body;

      const savedCV = await dbService.upsertCV(userId, cvData);

      return res.status(200).json({
        success: true,
        message: "CV saved successfully.",
        cv: savedCV,
      });
    } catch (error) {
      console.error("Save CV Error:", error);
      return res.status(500).json({ success: false, error: "Failed to save CV changes." });
    }
  },
};

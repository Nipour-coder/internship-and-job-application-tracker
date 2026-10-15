import { Router } from "express";
import { settingsController } from "../controllers/settings.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateToken);

router.get("/notifications", settingsController.getNotifications);
router.put("/notifications", settingsController.updateNotifications);
router.get("/job-preferences", settingsController.getJobPreferences);
router.put("/job-preferences", settingsController.updateJobPreferences);

export default router;

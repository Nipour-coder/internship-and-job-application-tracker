import { Router } from "express";
import { notificationsController } from "../controllers/notifications.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateToken);

router.get("/", notificationsController.getAll);
router.put("/read-all", notificationsController.markAllRead);
router.put("/:id/read", notificationsController.markRead);

export default router;

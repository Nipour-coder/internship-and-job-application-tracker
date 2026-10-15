import { Router } from "express";
import { savedJobsController } from "../controllers/savedJobs.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateToken);

router.get("/", savedJobsController.getAll);
router.post("/", savedJobsController.create);
router.post("/:id/convert", savedJobsController.convertToApplication);
router.delete("/:id", savedJobsController.delete);

export default router;

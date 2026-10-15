import { Router } from "express";
import { jobsController } from "../controllers/jobs.controller";

const router = Router();

router.get("/search", jobsController.search);
router.get("/:id", jobsController.getById);
router.get("/", jobsController.getAll);

export default router;

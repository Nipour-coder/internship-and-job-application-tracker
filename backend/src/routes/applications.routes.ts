import { Router } from "express";
import { applicationsController } from "../controllers/applications.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateToken);

router.get("/", applicationsController.getAll);
router.get("/stats", applicationsController.getStats);
router.get("/:id", applicationsController.getById);
router.post("/", applicationsController.create);
router.put("/:id", applicationsController.update);
router.delete("/:id", applicationsController.delete);

export default router;

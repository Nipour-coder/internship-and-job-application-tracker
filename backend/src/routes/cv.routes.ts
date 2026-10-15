import { Router } from "express";
import { cvController } from "../controllers/cv.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateToken);

router.get("/", cvController.get);
router.post("/", cvController.save);
router.put("/", cvController.save);

export default router;

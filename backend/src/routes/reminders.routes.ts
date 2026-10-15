import { Router } from "express";
import { remindersController } from "../controllers/reminders.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateToken);

router.get("/", remindersController.getAll);
router.post("/", remindersController.create);
router.put("/:id", remindersController.update);
router.delete("/:id", remindersController.delete);

export default router;

import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", authenticateToken, authController.me);
router.get("/callback/:provider", authController.socialLoginCallback);
router.get("/:provider", authController.socialLoginRedirect);

export default router;

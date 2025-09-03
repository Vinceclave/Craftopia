// apps/backend/src/routes/auth.route.ts - Updated with validation middleware
import { Router } from "express";
import { register, login, verifyEmail, refreshToken } from "@/controllers/auth.controller";
import { 
  validateRegistration, 
  validateLogin, 
  validateRefreshToken 
} from "@/middlewares/validation.middleware";

const router = Router();

router.post("/register", validateRegistration, register);
router.post("/login", validateLogin, login);
router.get("/verify-email", verifyEmail);
router.post("/refresh-token", validateRefreshToken, refreshToken);

export default router;
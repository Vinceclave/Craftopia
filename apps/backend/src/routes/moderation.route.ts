// routes/moderation.route.ts
import { Router } from "express";
import * as moderationController from "../controllers/moderation.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Only admins can log moderation actions
router.post("/", authMiddleware, moderationController.createLog);

// Admins can fetch all moderation logs
router.get("/", authMiddleware, moderationController.getLogs);

export default router;

// apps/backend/src/ai/routes/index.ts - Updated with authentication
import { Router } from "express";
import { analyzeImage } from "../controllers/recycling.controller";
import { createCraft } from "../controllers/craft.controller";
import { analyzeAndCraft, testImageDetection } from "../controllers/analyze.controller";
import { authenticateToken } from "@/middlewares/auth.middleware";
import { validateImageUpload } from "@/middlewares/validation.middleware";

const router = Router();

// Public routes (no authentication required)
router.post("/test-detection", validateImageUpload, testImageDetection);

// Protected routes (authentication required)
router.post("/analyze", authenticateToken, validateImageUpload, analyzeImage);
router.post("/craft", authenticateToken, createCraft);
router.post("/analyze-and-craft", authenticateToken, validateImageUpload, analyzeAndCraft);

// Optional auth routes (works with or without authentication)
// router.post("/public-analyze", optionalAuth, validateImageUpload, analyzeImage);

export default router;
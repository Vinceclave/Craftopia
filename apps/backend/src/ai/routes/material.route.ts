// apps/backend/src/ai/routes/material.route.ts

import { Router } from "express";
import {
  detectMaterials,
  generateProjects,
  analyzeMaterialsAndGenerate,
} from "../controllers/material.controller";
import { requireAuth } from "../../middlewares/rolebase.middleware";

const router = Router();

// Detect recyclable materials from image
router.post("/detect", requireAuth, detectMaterials);

// Generate DIY projects from detection result
router.post("/generate-projects", requireAuth, generateProjects);

// Complete pipeline: detect + generate
router.post("/analyze", requireAuth, analyzeMaterialsAndGenerate);

export default router;
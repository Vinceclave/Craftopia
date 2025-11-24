// apps/backend/src/ai/routes/material.route.ts

import { Router } from "express";
import {
  detectMaterials,
} from "../controllers/material.controller";
import { requireAuth } from "../../middlewares/rolebase.middleware";

const router = Router();

// Detect recyclable materials from image
router.post("/detect", requireAuth, detectMaterials);

export default router;
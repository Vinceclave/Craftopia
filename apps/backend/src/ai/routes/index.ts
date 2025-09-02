import { Router } from "express";
import { analyzeImage } from "../controllers/recycling.controller";
import { createCraft } from "../controllers/craft.controller";
import { analyzeAndCraft } from "../controllers/analyze.controller";

const router = Router();

// Analyze image for recyclable materials
router.post("/analyze", analyzeImage);

// Generate craft from materials
router.post("/craft", createCraft);

// Analyze image and generate craft in one step
router.post("/analyze-and-craft", analyzeAndCraft);

export default router;
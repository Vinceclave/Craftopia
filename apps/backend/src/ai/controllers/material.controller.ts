// apps/backend/src/ai/controllers/material.controller.ts

import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/response";
import {
  detectMaterialsFromImage,
  generateDIYProjects,
  analyzeImageAndGenerateProjects,
} from "../services/material.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

/**
 * Detect recyclable materials from uploaded image
 * POST /api/v1/ai/material/detect
 */
export const detectMaterials = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { imageUrl } = req.body;

    if (!imageUrl?.trim()) {
      return sendError(res, "Image URL is required", 400);
    }

    const detection = await detectMaterialsFromImage(imageUrl);

    return sendSuccess(
      res,
      detection,
      "Materials detected successfully"
    );
  }
);

/**
 * Generate DIY projects from material detection result
 * POST /api/v1/ai/material/generate-projects
 */
export const generateProjects = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { detection, preferences } = req.body;

    if (!detection || !detection.detectedMaterials) {
      return sendError(res, "Material detection result is required", 400);
    }

    const projects = await generateDIYProjects(detection, preferences);

    return sendSuccess(
      res,
      { projects, detection },
      "DIY projects generated successfully"
    );
  }
);

/**
 * Complete pipeline: Detect materials and generate projects
 * POST /api/v1/ai/material/analyze
 */
export const analyzeMaterialsAndGenerate = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { imageUrl, preferences } = req.body;

    if (!imageUrl?.trim()) {
      return sendError(res, "Image URL is required", 400);
    }

    const result = await analyzeImageAndGenerateProjects(imageUrl, preferences);

    return sendSuccess(
      res,
      result,
      "Image analyzed and projects generated successfully"
    );
  }
);
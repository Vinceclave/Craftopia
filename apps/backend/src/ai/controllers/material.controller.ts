// apps/backend/src/ai/controllers/material.controller.ts

import { Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/response";
import { detectMaterialsFromImage } from "../services/material.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

/**
 * Detect recyclable materials from uploaded image
 * POST /api/v1/ai/material/detect
 * @body { imageUrl: string }
 * @returns { materials: string[] }
 */
export const detectMaterials = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { imageBase64 } = req.body;

    if (!imageBase64?.trim()) {
      return sendError(res, "Base64 image is required", 400);
    }

    const materials = await detectMaterialsFromImage(imageBase64);

    return sendSuccess(
      res,
      { materials },
      "Materials detected successfully"
    );
  }
);



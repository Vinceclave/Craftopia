import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../utils/response";
import { recognizeImage } from "../services/image.service";

export const imageRecognition = asyncHandler(
  async (req: Request, res: Response) => {
    const { url } = req.body;

    if (!url?.trim()) {
      return sendError(res, "Image URL is required", 400); // Fixed: Added return
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return sendError(res, "Invalid URL format", 400);
    }

    const response = await recognizeImage(url.trim());
    return sendSuccess(res, response, "Image recognized successfully");
  }
);
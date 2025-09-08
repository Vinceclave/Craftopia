import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../utils/response";
import { AppError } from "../../utils/error";
import { recognizeImage } from "../services/image.service";

export const imageRecognition = asyncHandler(
  async (req: Request, res: Response) => {
    const { url } = req.body; // ✅ correctly destructure

    if (!url) sendError(res,"Image URL is required", 400);

    const response = await recognizeImage(url);
    return sendSuccess(res, response, "Image recognized successfully");
  }
);

import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../utils/response";
import { createChallengeVerificationPrompt } from "../prompt/image.prompt";
import { ai } from "../gemini/client";
import { parseResponse } from "../utils/responseParser";
import fs from "fs";
import path from "path";
import { config } from "../../config";

export const verifyChallengeWithUpload = asyncHandler(
  async (req: Request, res: Response) => {
    const { 
      challengeDescription,
      imageUrl, // e.g., "/uploads/challenges/proof_123.jpg"
      challengePoints,
      userId 
    } = req.body;

    if (!challengeDescription?.trim()) {
      return sendError(res, "Challenge description is required", 400);
    }

    if (!imageUrl?.trim()) {
      return sendError(res, "Proof image URL is required", 400);
    }

    if (!challengePoints || challengePoints <= 0) {
      return sendError(res, "Valid challenge points required", 400);
    }

    try {
      // Convert imageUrl to file path
      const filePath = path.join(process.cwd(), imageUrl);
      
      if (!fs.existsSync(filePath)) {
        return sendError(res, "Proof image file not found", 404);
      }

      // Read and encode image
      const imageBuffer = fs.readFileSync(filePath);
      const base64ImageData = imageBuffer.toString("base64");
      
      const ext = path.extname(filePath).toLowerCase();
      const contentType = ext === '.png' ? 'image/png' : 
                         ext === '.webp' ? 'image/webp' : 'image/jpeg';

      // Create verification prompt
      const prompt = createChallengeVerificationPrompt(
        challengeDescription,
        imageUrl, // pass the URL for reference
        challengePoints,
        Date.now(),
        userId
      );

      // Send to AI for verification
      const result = await ai.models.generateContent({
        model: config.ai.model,
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: contentType,
                  data: base64ImageData,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
      });

      const text = result.text;
      if (!text?.trim()) {
        return sendError(res, "AI verification failed", 500);
      }

      const verification = parseResponse(text);
      if (!verification || typeof verification !== "object") {
        return sendError(res, "Invalid AI verification format", 500);
      }

      return sendSuccess(res, verification, "Challenge verification completed");

    } catch (error) {
      console.error("Challenge verification error:", error);
      return sendError(res, "Failed to verify challenge", 500);
    }
  }
);
import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../utils/response";
import { createChallengeVerificationPrompt } from "../prompt/image.prompt";
import { ai } from "../gemini/client";
import { parseJsonFromMarkdown } from "../utils/responseParser";
import fs from "fs";
import path from "path";
import { config } from "../../config";

export const verifyChallengeWithUpload = asyncHandler(
  async (req: Request, res: Response) => {
    const { challengeDescription, imageUrl, challengePoints, userId } = req.body;

    // Basic validation
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
      const filePath = path.join(process.cwd(), imageUrl);

      if (!fs.existsSync(filePath)) {
        return sendError(res, "Proof image file not found", 404);
      }

      // Read & encode image as base64
      const imageBuffer = fs.readFileSync(filePath);
      const base64ImageData = imageBuffer.toString("base64");

      const ext = path.extname(filePath).toLowerCase();
      const contentType = ext === ".png"
        ? "image/png"
        : ext === ".webp"
        ? "image/webp"
        : "image/jpeg";

      // Create prompt for AI
      const prompt = createChallengeVerificationPrompt(
        challengeDescription,
        imageUrl,
        challengePoints,
        Date.now(),
        userId
      );

      console.log("Sending request to AI for verification...");

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

      const rawText = result.text;

      console.log("Raw AI response:", rawText);

      if (!rawText?.trim()) {
        return sendError(res, "AI verification failed - empty response", 500);
      }

      let verification;
      try {
        verification = parseJsonFromMarkdown(rawText);
        console.log("Parsed verification result:", verification);
      } catch (parseError) {
        console.error("Failed to parse AI verification response:", parseError);
        return sendError(res, "Invalid AI verification format", 500);
      }

      // Validate parsed verification object structure
      if (
        !verification ||
        typeof verification !== "object" ||
        Array.isArray(verification)
      ) {
        return sendError(res, "Invalid verification object", 500);
      }

      const requiredFields = ["status", "points_awarded", "ai_confidence_score"];
      for (const field of requiredFields) {
        if (
          verification[field] === undefined ||
          verification[field] === null
        ) {
          return sendError(res, `Missing required field: ${field}`, 500);
        }
      }

      // Success - return verification data
      return sendSuccess(res, verification, "Challenge verification completed");
    } catch (error: any) {
      console.error("Challenge verification error:", error);

      if (error.message?.includes("quota")) {
        return sendError(res, "AI service quota exceeded", 503);
      }

      if (error.message?.includes("network")) {
        return sendError(res, "Network error during AI verification", 502);
      }

      return sendError(res, "Failed to verify challenge", 500);
    }
  }
);

import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../utils/response";
import { createChallengeVerificationPrompt } from "../prompt/image.prompt";
import { ai } from "../gemini/client";
import { parseJsonFromMarkdown } from "../utils/responseParser";
import { config } from "../../config";

/**
 * Fetch image from URL and convert to base64
 */
async function fetchImageAsBase64(imageUrl: string): Promise<{ base64: string; contentType: string }> {
  try {
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error("URL does not point to a valid image");
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > config.ai.maxFileSize) {
      throw new Error(`Image too large (max ${config.ai.maxFileSize / (1024 * 1024)}MB)`);
    }

    const imageArrayBuffer = await response.arrayBuffer();
    
    if (imageArrayBuffer.byteLength > config.ai.maxFileSize) {
      throw new Error(`Image too large (max ${config.ai.maxFileSize / (1024 * 1024)}MB)`);
    }

    const base64ImageData = Buffer.from(imageArrayBuffer).toString("base64");

    return {
      base64: base64ImageData,
      contentType
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch image: ${error.message}`);
  }
}

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
      console.log("🔍 Starting challenge verification");
      console.log("📸 Image URL:", imageUrl);

      // Fetch image from S3 URL and convert to base64
      const { base64: base64ImageData, contentType } = await fetchImageAsBase64(imageUrl);

      console.log("✅ Image fetched successfully");

      // Create prompt for AI
      const prompt = createChallengeVerificationPrompt(
        challengeDescription,
        imageUrl,
        challengePoints,
        Date.now(),
        userId
      );

      console.log("🤖 Sending request to AI for verification...");

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

      console.log("📝 Raw AI response:", rawText);

      if (!rawText?.trim()) {
        return sendError(res, "AI verification failed - empty response", 500);
      }

      let verification;
      try {
        verification = parseJsonFromMarkdown(rawText);
        console.log("✅ Parsed verification result:", verification);
      } catch (parseError) {
        console.error("❌ Failed to parse AI verification response:", parseError);
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
      console.error("❌ Challenge verification error:", error);

      if (error.message?.includes("quota")) {
        return sendError(res, "AI service quota exceeded", 503);
      }

      if (error.message?.includes("network")) {
        return sendError(res, "Network error during AI verification", 502);
      }

      if (error.message?.includes("fetch image")) {
        return sendError(res, error.message, 400);
      }

      return sendError(res, "Failed to verify challenge", 500);
    }
  }
);
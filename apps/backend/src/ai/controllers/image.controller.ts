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
      imageUrl,
      challengePoints,
      userId
    } = req.body;

    // Validation
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
        imageUrl,
        challengePoints,
        Date.now(),
        userId
      );

      console.log("Sending request to AI for verification...");

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

      const rawText = result.text;
      console.log("Raw AI response:", rawText);

      if (!rawText?.trim()) {
        return sendError(res, "AI verification failed - empty response", 500);
      }

      // Parse the response ONCE
      let verification;
      try {
        verification = parseResponse(rawText);
        console.log("Parsed verification result:", verification);
      } catch (parseError) {
        console.error("Parse error:", parseError);
        return sendError(res, "Invalid AI verification format", 500);
      }

      // Validate the verification object
      if (!verification || typeof verification !== "object") {
        return sendError(res, "Invalid verification object", 500);
      }

      // Ensure all required fields are present
      const requiredFields = ['status', 'points_awarded', 'ai_confidence_score'];
      for (const field of requiredFields) {
        if (verification[field] === undefined || verification[field] === null) {
          return sendError(res, `Missing required field: ${field}`, 500);
        }
      }

      // Return the verification result ONCE
      return sendSuccess(res, verification, "Challenge verification completed");

    } catch (error: any) {
      console.error("Challenge verification error:", error);
      
      // Provide more specific error messages
      if (error.message?.includes('quota')) {
        return sendError(res, "AI service quota exceeded", 503);
      }
      
      if (error.message?.includes('network')) {
        return sendError(res, "Network error during AI verification", 502);
      }
      
      return sendError(res, "Failed to verify challenge", 500);
    }
  }
);
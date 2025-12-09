// apps/backend/src/ai/services/material.service.ts

import { ai } from "../gemini/client";
import { AppError } from "../../utils/error";
import { config } from "../../config";
import { createMaterialDetectionPrompt } from "../prompt/material.prompt";
import axios from "axios";

/**
 * Detect recyclable materials from an image URL
 * @param imageUrl - Public URL of the image to analyze
 * @returns Array of detected material strings
 */
export const detectMaterialsFromImage = async (
  imageBase64: string
): Promise<string[]> => {
  if (!imageBase64?.trim()) {
    throw new AppError("Base64 image is required", 400);
  }

  try {
    // Extract MIME type and strip "data:image/png;base64,"
    const matches = imageBase64.match(/^data:(image\/\w+);base64,(.*)$/);

    if (!matches) {
      throw new AppError("Invalid base64 image format", 400);
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    const prompt = createMaterialDetectionPrompt();

    // Send to AI model
    const response = await ai.models.generateContent({
      model: config.ai.model,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
    });

    const rawText = response.text;

    if (!rawText?.trim()) {
      throw new AppError("AI returned empty response", 500);
    }

    // Parse JSON
    let materials: string[];
    try {
      let cleaned = rawText.replace(/```json|```/g, "").trim();
      materials = JSON.parse(cleaned);

      if (!Array.isArray(materials)) {
        throw new Error("Expected array");
      }
    } catch {
      throw new AppError("Invalid AI response format", 500);
    }

    return materials;
  } catch (error: any) {
    console.error("❌ Base64 detection error:", error);

    if (error instanceof AppError) throw error;

    throw new AppError(error.message || "Failed to detect materials", 500);
  }
};

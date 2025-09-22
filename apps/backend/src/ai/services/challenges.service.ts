import { ai } from "../gemini/client";
import { AppError } from "../../utils/error";
import { challengePrompt } from "../prompt/challenges.prompt";
import { parseResponse } from "../utils/responseParser";
import { config } from "../../config";

export const generateChallenge = async () => {
  try {
    const response = await ai.models.generateContent({
      model: config.ai.model,
      contents: challengePrompt,
    });

    const text = response.text;
    if (!text?.trim()) {
      throw new AppError("AI did not return a response", 500);
    }

    const parsed = parseResponse(text);
    if (!parsed || typeof parsed !== "object") {
      throw new AppError("AI did not return a valid challenge", 500);
    }

    // Validate required fields
    const requiredFields = ['title', 'description', 'pointsReward', 'materialType'];
    const missingFields = requiredFields.filter(field => !parsed[field]);
    
    if (missingFields.length > 0) {
      throw new AppError(`AI response missing required fields: ${missingFields.join(', ')}`, 500);
    }

    // Validate point range
    if (parsed.pointsReward < 1 || parsed.pointsReward > 100) {
      parsed.pointsReward = Math.max(1, Math.min(100, parsed.pointsReward));
    }

    return parsed;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    console.error('AI Challenge Generation Error:', error);
    throw new AppError("Failed to generate challenge from AI service", 500);
  }
};

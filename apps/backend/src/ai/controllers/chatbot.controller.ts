import { ai } from "../gemini/client";
import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/response";
import { config } from "../../config";

export const handleAIChat = asyncHandler(async (req: Request, res: Response) => {
  const { message } = req.body;

  // System prompt (Craftopia FAQ only)
  const prompt = `
  You are Craftopia's official FAQ assistant. 
  - Only answer questions related to Craftopia (an AI-driven craft generator for sustainable upcycling).
  - If the user asks something unrelated, politely respond that you can only help with Craftopia-related questions.
  - Be clear, concise, and user-friendly.
  
  Example FAQs you can answer:
  - "What is Craftopia?"
  - "How do I generate craft ideas?"
  - "What materials are supported?"
  - "Does Craftopia have eco-challenges?"
  - "How do I share my crafts in the community hub?"
  - "Is there a marketplace for crafts?"
  `;

  try {
    const response = await ai.models.generateContent({
      model: config.ai.model, // ✅ should be model name, e.g. "gemini-1.5-flash"
      contents: [
        { role: "user", parts: [{ text: `${prompt}\nUser: ${message}` }] }
      ]
    });

    const answer =
      response?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response.";

    return sendSuccess(res, answer);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to process AI chat.");
  }
});

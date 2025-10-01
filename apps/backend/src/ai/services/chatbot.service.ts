import { ai } from "../gemini/client";
import { AppError } from "../../utils/error";
import { parseJsonFromMarkdown } from "../utils/responseParser";
import { config } from "../../config";
import { systemPrompt } from "../prompt/chatbot.prompt";

export const chatAiResponse = async (message: string): Promise<string> => {
  if (!message?.trim()) {
    throw new AppError("Message is required", 400);
  }

  try {
    const response = await ai.models.generateContent({
      model: config.ai.model,
      contents: `${systemPrompt}\n\nUser Question: ${message.trim()}\n\nYour Response:`,
    });

    return (
      response?.text?.trim() ||
      "Sorry, I couldn't generate a response. Please try rephrasing your question."
    );
  } catch (err: any) {
    // We *do* catch here only to wrap raw errors into AppError
    throw new AppError(err.message || "AI chat service error", 500);
  }
};

import { ai } from "../gemini/client";
import { AppError } from "../../utils/error";
import { config } from "../../config";
import { systemPrompt } from "../prompt/chatbot.prompt";
import prisma from "../../config/prisma";

/**
 * Generate AI response with conversation history context
 */
export const chatAiResponse = async (
  message: string,
  conversationHistory?: Array<{ role: string; content: string }>
): Promise<string> => {
  if (!message?.trim()) {
    throw new AppError("Message is required", 400);
  }

  try {
    // Build conversation context
    let fullPrompt = systemPrompt + "\n\n";
    
    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      fullPrompt += "Previous conversation:\n";
      conversationHistory.forEach((msg) => {
        const role = msg.role === "user" ? "User" : "Craftopia AI";
        fullPrompt += `${role}: ${msg.content}\n`;
      });
      fullPrompt += "\n";
    }
    
    // Add current user message
    fullPrompt += `User: ${message.trim()}\n\nCraftopia AI:`;

    console.log("🤖 Sending to AI with context...");

    const response = await ai.models.generateContent({
      model: config.ai.model,
      contents: fullPrompt,
    });

    const aiResponse = response?.text?.trim();
    
    if (!aiResponse) {
      throw new Error("Empty AI response");
    }

    console.log("✅ AI response generated");
    return aiResponse;
    
  } catch (err: any) {
    console.error("❌ AI chat error:", err);
    throw new AppError(
      err.message || "AI chat service error", 
      500
    );
  }
};

/**
 * Get conversation history for context
 */
export const getConversationContext = async (
  conversationId: number,
  limit: number = 10
): Promise<Array<{ role: string; content: string }>> => {
  const messages = await prisma.chatbotMessage.findMany({
    where: { conversation_id: conversationId },
    orderBy: { created_at: "desc" },
    take: limit,
    select: {
      sender: true,
      content: true,
    },
  });

  // Reverse to get chronological order
  return messages.reverse().map((msg) => ({
    role: msg.sender === "user" ? "user" : "assistant",
    content: msg.content,
  }));
};
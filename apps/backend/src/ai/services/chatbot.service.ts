import { ai } from "../gemini/client";
import { AppError } from "../../utils/error";
import { config } from "../../config";
import { systemPrompt } from "../prompt/chatbot.prompt";
import prisma from "../../config/prisma";

/**
 * Clean markdown formatting from AI response to make it look more natural
 */
const cleanMarkdownFormatting = (text: string): string => {
  let cleaned = text;
  
  // Remove bold (**text** or __text__)
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1');
  cleaned = cleaned.replace(/__(.+?)__/g, '$1');
  
  // Remove italic (*text* or _text_)
  cleaned = cleaned.replace(/\*(.+?)\*/g, '$1');
  cleaned = cleaned.replace(/_(.+?)_/g, '$1');
  
  // Remove strikethrough (~~text~~)
  cleaned = cleaned.replace(/~~(.+?)~~/g, '$1');
  
  // Remove headers (# text, ## text, etc.)
  cleaned = cleaned.replace(/^#{1,6}\s+(.+)$/gm, '$1');
  
  // Remove code blocks (```text```)
  cleaned = cleaned.replace(/```[\s\S]*?```/g, (match) => {
    return match.replace(/```\w*\n?/g, '').replace(/```/g, '');
  });
  
  // Remove inline code (`text`)
  cleaned = cleaned.replace(/`(.+?)`/g, '$1');
  
  // Remove links but keep text ([text](url))
  cleaned = cleaned.replace(/\[(.+?)\]\(.+?\)/g, '$1');
  
  // Remove horizontal rules (---, ***, ___)
  cleaned = cleaned.replace(/^[-*_]{3,}$/gm, '');
  
  // Remove blockquotes (> text)
  cleaned = cleaned.replace(/^>\s+(.+)$/gm, '$1');
  
  // Clean up bullet points - keep them but remove markdown symbols
  cleaned = cleaned.replace(/^[\*\-\+]\s+/gm, '• ');
  
  // Clean up numbered lists - keep numbers
  cleaned = cleaned.replace(/^\d+\.\s+/gm, (match) => match);
  
  // Clean up multiple newlines (max 2 consecutive)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
};

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

    // Clean markdown formatting from the response
    const cleanedResponse = cleanMarkdownFormatting(aiResponse);

    console.log("✅ AI response generated and cleaned");
    return cleanedResponse;
    
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
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { 
  createChatConversation, 
  createChatMessage, 
  getConversationWithMessages 
} from "../services/chatbot.service";
import { 
  chatAiResponse, 
  getConversationContext 
} from "../ai/services/chatbot.service";
import { sendSuccess } from "../utils/response";
import { AuthRequest } from "../middlewares/auth.middleware";
import prisma from "../config/prisma";

// ⭐ MAIN ENDPOINT: Chat with AI (with conversation history)
export const handleChatWithAI = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { message } = req.body;
  const userId = req.user!.userId;

  // Validation
  if (!message || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: "Message content is required"
    });
  }

  if (message.length > 2000) {
    return res.status(400).json({
      success: false,
      message: "Message too long (max 2000 characters)"
    });
  }

  console.log(`💬 User ${userId} sent message: "${message.substring(0, 50)}..."`);

  // 1. Get or create conversation for this user
  let conversation = await prisma.chatbotConversation.findUnique({
    where: { user_id: userId }
  });

  if (!conversation) {
    console.log("📝 Creating new conversation...");
    conversation = await createChatConversation({ user_id: userId });
  }

  // 2. Get conversation history for context (last 10 messages)
  const conversationHistory = await getConversationContext(
    conversation.conversation_id, 
    10
  );

  console.log(`📚 Retrieved ${conversationHistory.length} previous messages`);

  // 3. Save user's message to database
  const userMessage = await createChatMessage({
    conversation_id: conversation.conversation_id,
    sender: "user",
    content: message.trim()
  });

  console.log(`✅ User message saved (ID: ${userMessage.message_id})`);

  // 4. Generate AI response with conversation context
  const aiResponseText = await chatAiResponse(message, conversationHistory);

  console.log(`🤖 AI response: "${aiResponseText.substring(0, 100)}..."`);

  // 5. Save AI's response to database
  const aiMessage = await createChatMessage({
    conversation_id: conversation.conversation_id,
    sender: "ai",
    content: aiResponseText
  });

  console.log(`✅ AI message saved (ID: ${aiMessage.message_id})`);

  // 6. Update conversation timestamp
  await prisma.chatbotConversation.update({
    where: { conversation_id: conversation.conversation_id },
    data: { updated_at: new Date() }
  });

  // 7. Return both messages
  return sendSuccess(res, {
    conversation_id: conversation.conversation_id,
    userMessage: {
      message_id: userMessage.message_id,
      content: userMessage.content,
      sender: userMessage.sender,
      created_at: userMessage.created_at
    },
    aiMessage: {
      message_id: aiMessage.message_id,
      content: aiMessage.content,
      sender: aiMessage.sender,
      created_at: aiMessage.created_at
    },
    total_messages: conversationHistory.length + 2
  }, "Chat completed successfully");
});

// Get full conversation history
export const handleGetConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  console.log(`📖 Fetching conversation for user ${userId}`);

  const conversation = await prisma.chatbotConversation.findUnique({
    where: { user_id: userId },
    include: {
      messages: {
        orderBy: { created_at: "asc" },
        select: {
          message_id: true,
          sender: true,
          content: true,
          created_at: true
        }
      }
    }
  });

  if (!conversation) {
    return sendSuccess(res, {
      conversation_id: null,
      user_id: userId,
      messages: [],
      total_messages: 0
    }, "No conversation found");
  }

  return sendSuccess(res, {
    conversation_id: conversation.conversation_id,
    user_id: conversation.user_id,
    created_at: conversation.created_at,
    updated_at: conversation.updated_at,
    messages: conversation.messages,
    total_messages: conversation.messages.length
  }, "Conversation loaded successfully");
});

// Clear conversation history
export const handleClearConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  console.log(`🗑️ Clearing conversation for user ${userId}`);

  const conversation = await prisma.chatbotConversation.findUnique({
    where: { user_id: userId }
  });

  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: "No conversation found"
    });
  }

  // Delete all messages in this conversation
  await prisma.chatbotMessage.deleteMany({
    where: { conversation_id: conversation.conversation_id }
  });

  console.log(`✅ Conversation cleared for user ${userId}`);

  return sendSuccess(res, {
    conversation_id: conversation.conversation_id,
    messages_deleted: true
  }, "Conversation cleared successfully");
});

// Legacy endpoints (keep for backward compatibility)
export const handleCreateConversation = asyncHandler(async (req: Request, res: Response) => {
  const { user_id } = req.body;
  const conversation = await createChatConversation({ user_id });
  return sendSuccess(res, conversation, "Conversation ready");
});

export const handleCreateMessage = asyncHandler(async (req: Request, res: Response) => {
  const { conversation_id, sender, content } = req.body;
  const message = await createChatMessage({ conversation_id, sender, content });
  return sendSuccess(res, message, "Message created successfully");
});
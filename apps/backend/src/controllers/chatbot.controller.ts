import * as chatbotService from "../services/chatbot.service";
import { chatAiResponse, getConversationContext } from "../ai/services/chatbot.service";
import prisma from "../config/prisma";
import { sendSuccess, sendPaginatedSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { Request, Response } from "express";

export const handleChatWithAI = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { message } = req.body;
  const userId = req.user!.userId;

  // Get or create conversation
  let conversation = await prisma.chatbotConversation.findUnique({
    where: { user_id: userId }
  });

  if (!conversation) {
    conversation = await chatbotService.createChatConversation({ user_id: userId });
  }

  // Get conversation history
  const conversationHistory = await getConversationContext(
    conversation.conversation_id,
    10
  );

  // Save user message
  const userMessage = await chatbotService.createChatMessage({
    conversation_id: conversation.conversation_id,
    sender: "user",
    content: message.trim()
  });

  // Generate AI response
  const aiResponseText = await chatAiResponse(message, conversationHistory);

  // Save AI message
  const aiMessage = await chatbotService.createChatMessage({
    conversation_id: conversation.conversation_id,
    sender: "ai",
    content: aiResponseText
  });

  // Update conversation timestamp
  await prisma.chatbotConversation.update({
    where: { conversation_id: conversation.conversation_id },
    data: { updated_at: new Date() }
  });

  sendSuccess(res, {
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

export const handleGetConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

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

  sendSuccess(res, {
    conversation_id: conversation.conversation_id,
    user_id: conversation.user_id,
    created_at: conversation.created_at,
    updated_at: conversation.updated_at,
    messages: conversation.messages,
    total_messages: conversation.messages.length
  }, "Conversation loaded successfully");
});

export const handleClearConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  const conversation = await prisma.chatbotConversation.findUnique({
    where: { user_id: userId }
  });

  if (!conversation) {
    return sendSuccess(res, null, "No conversation found", 404);
  }

  await prisma.chatbotMessage.deleteMany({
    where: { conversation_id: conversation.conversation_id }
  });

  sendSuccess(res, {
    conversation_id: conversation.conversation_id,
    messages_deleted: true
  }, "Conversation cleared successfully");
});
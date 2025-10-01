import prisma from "../config/prisma";
import { AppError } from "../utils/error";
import { MessageSender } from "../generated/prisma";

// Create or fetch conversation (FAQ style: 1 per user)
export const createChatConversation = async (data: {
  user_id: number;
}) => {
  if (!data.user_id) {
    throw new AppError("User ID is required", 400);
  }

  const existing = await prisma.chatbotConversation.findUnique({
    where: { user_id: data.user_id },
  });

  if (existing) return existing;

  return prisma.chatbotConversation.create({
    data: {
      user_id: data.user_id,
    },
  });
};

// Create message
export const createChatMessage = async (data: {
  conversation_id: number;
  sender: MessageSender;
  content: string;
}) => {
  if (!data.content || data.content.trim().length === 0) {
    throw new AppError("Message content cannot be empty", 400);
  }

  // Ensure conversation exists
  const convo = await prisma.chatbotConversation.findUnique({
    where: { conversation_id: data.conversation_id },
  });

  if (!convo) {
    throw new AppError("Conversation not found", 404);
  }

  return prisma.chatbotMessage.create({
    data: {
      conversation_id: data.conversation_id,
      sender: data.sender,
      content: data.content.trim(),
    },
  });
};

// Get conversation with messages for a user
export const getConversationWithMessages = async (user_id: number) => {
  if (!user_id) {
    throw new AppError("User ID is required", 400);
  }

  const conversation = await prisma.chatbotConversation.findUnique({
    where: { user_id },
    include: {
      messages: {
        orderBy: { created_at: "asc" },
      },
    },
  });

  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }

  return conversation;
};

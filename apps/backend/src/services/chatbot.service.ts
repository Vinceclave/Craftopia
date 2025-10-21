import { MessageSender } from "../generated/prisma";
import { BaseService } from "./base.service";
import { ValidationError } from '../utils/error';
import { logger } from "../utils/logger";
import prisma from "../config/prisma";

class ChatbotService extends BaseService {
  // Create or get conversation
  async createChatConversation(data: { user_id: number }) {
    this.validateId(data.user_id, 'User ID');

    logger.debug('Creating chat conversation', { userId: data.user_id });

    const existing = await prisma.chatbotConversation.findUnique({
      where: { user_id: data.user_id },
    });

    if (existing) {
      logger.debug('Conversation already exists', { conversationId: existing.conversation_id });
      return existing;
    }

    const conversation = await prisma.chatbotConversation.create({
      data: {
        user_id: data.user_id,
      },
    });

    logger.info('Chat conversation created', { conversationId: conversation.conversation_id });

    return conversation;
  }

  // Create message
  async createChatMessage(data: {
    conversation_id: number;
    sender: MessageSender;
    content: string;
  }) {
    this.validateId(data.conversation_id, 'Conversation ID');
    this.validateRequiredString(data.content, 'Message content', 1, 5000);

    if (!Object.values(MessageSender).includes(data.sender)) {
      throw new ValidationError('Invalid message sender');
    }

    logger.debug('Creating chat message', { 
      conversationId: data.conversation_id,
      sender: data.sender 
    });

    // Ensure conversation exists
    const convo = await prisma.chatbotConversation.findUnique({
      where: { conversation_id: data.conversation_id },
    });

    if (!convo) {
      throw new ValidationError('Conversation not found');
    }

    return prisma.chatbotMessage.create({
      data: {
        conversation_id: data.conversation_id,
        sender: data.sender,
        content: data.content.trim(),
      },
    });
  }

  // Get conversation with messages
  async getConversationWithMessages(userId: number) {
    this.validateId(userId, 'User ID');

    logger.debug('Fetching conversation with messages', { userId });

    const conversation = await prisma.chatbotConversation.findUnique({
      where: { user_id: userId },
      include: {
        messages: {
          orderBy: { created_at: "asc" },
        },
      },
    });

    if (!conversation) {
      logger.debug('No conversation found', { userId });
      return null;
    }

    return conversation;
  }

  // Delete conversation messages
  async clearConversation(userId: number) {
    this.validateId(userId, 'User ID');

    logger.info('Clearing conversation', { userId });

    const conversation = await prisma.chatbotConversation.findUnique({
      where: { user_id: userId }
    });

    if (!conversation) {
      return null;
    }

    const result = await prisma.chatbotMessage.deleteMany({
      where: { conversation_id: conversation.conversation_id }
    });

    logger.info('Conversation cleared', { 
      userId, 
      deletedMessages: result.count 
    });

    return result;
  }

  // Get conversation statistics
  async getConversationStats(userId: number) {
    this.validateId(userId, 'User ID');

    const conversation = await prisma.chatbotConversation.findUnique({
      where: { user_id: userId },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });

    if (!conversation) {
      return {
        exists: false,
        totalMessages: 0
      };
    }

    const [userMessages, aiMessages] = await Promise.all([
      prisma.chatbotMessage.count({
        where: {
          conversation_id: conversation.conversation_id,
          sender: MessageSender.user
        }
      }),
      prisma.chatbotMessage.count({
        where: {
          conversation_id: conversation.conversation_id,
          sender: MessageSender.ai
        }
      })
    ]);

    return {
      exists: true,
      conversationId: conversation.conversation_id,
      totalMessages: conversation._count.messages,
      userMessages,
      aiMessages,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at
    };
  }
}

// Export singleton instance
export const chatbotService = new ChatbotService();

// Export individual functions for backward compatibility
export const createChatConversation = chatbotService.createChatConversation.bind(chatbotService);
export const createChatMessage = chatbotService.createChatMessage.bind(chatbotService);
export const getConversationWithMessages = chatbotService.getConversationWithMessages.bind(chatbotService);
export const clearConversation = chatbotService.clearConversation.bind(chatbotService);
export const getConversationStats = chatbotService.getConversationStats.bind(chatbotService);
import { apiService } from './base.service';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatResponse {
  data: {
    conversation_id: number;
    userMessage: {
      message_id: number;
      content: string;
      sender: string;
      created_at: string;
    };
    aiMessage: {
      message_id: number;
      content: string;
      sender: string;
      created_at: string;
    };
    total_messages: number;
  };
}

interface ConversationHistoryResponse {
  data: {
    conversation_id: number | null;
    user_id: number;
    messages: Array<{
      message_id: number;
      sender: 'user' | 'ai';
      content: string;
      created_at: string;
    }>;
    total_messages: number;
  };
}

class ChatbotService {
  /**
   * Send a message and get AI response with conversation history stored in DB
   */
  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      const response = await apiService.request<ChatResponse>(
        '/api/v1/chatbot/chat',
        {
          method: 'POST',
          data: { message: message.trim() }
        }
      );

      return response;
    } catch (error: any) {
      console.error('Chatbot service error:', error);
      throw new Error(error.message || 'Failed to get response from AI');
    }
  }

  /**
   * Get conversation history from database
   */
  async getConversationHistory(): Promise<ChatMessage[]> {
    try {
      const response = await apiService.request<ConversationHistoryResponse>(
        '/api/v1/chatbot/history',
        { method: 'GET' }
      );

      // If no conversation exists yet, return welcome message
      if (!response.data.messages || response.data.messages.length === 0) {
        return [
          {
            id: 'welcome',
            text: "Hello! 👋 I'm your Craftopia AI assistant. I can help you with:\n\n• Creative craft ideas from recycled materials\n• Step-by-step crafting instructions\n• Tips for sustainable living\n• Guidance on eco-challenges\n\nWhat would you like to create today?",
            isUser: false,
            timestamp: new Date(),
          },
        ];
      }

      // Transform backend format to frontend format
      return response.data.messages.map(msg => ({
        id: msg.message_id.toString(),
        text: msg.content,
        isUser: msg.sender === 'user',
        timestamp: new Date(msg.created_at)
      }));
    } catch (error: any) {
      console.error('Failed to load conversation history:', error);
      
      // If error is 404 (no conversation yet), return welcome message
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        return [
          {
            id: 'welcome',
            text: "Hello! 👋 I'm your Craftopia AI assistant. What would you like to create today?",
            isUser: false,
            timestamp: new Date(),
          },
        ];
      }
      
      throw error;
    }
  }

  /**
   * Clear conversation history
   */
  async clearConversationHistory(): Promise<void> {
    try {
      await apiService.request('/api/v1/chatbot/clear', {
        method: 'DELETE'
      });
    } catch (error: any) {
      console.error('Failed to clear conversation history:', error);
      throw new Error(error.message || 'Failed to clear conversation history');
    }
  }
}

export const chatbotService = new ChatbotService();
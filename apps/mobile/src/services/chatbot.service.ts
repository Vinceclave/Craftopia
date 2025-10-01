import { apiService } from './base.service';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatResponse {
  message: string;
  timestamp: string;
}

class ChatbotService {
  async sendMessage(
    message: string, 
    conversationHistory?: ChatMessage[]
  ): Promise<string> {
    try {
      const response = await apiService.request<{ data: ChatResponse }>(
        '/api/v1/ai/chatbot/chat',
        {
          method: 'POST',
          data: {
            message: message.trim(),
            conversationHistory: conversationHistory?.slice(-10) // Last 10 messages for context
          }
        }
      );

      return response.data.message;
    } catch (error: any) {
      console.error('Chatbot service error:', error);
      throw new Error(error.message || 'Failed to get response from AI');
    }
  }
}

export const chatbotService = new ChatbotService();
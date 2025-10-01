import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatbotService, ChatMessage } from '~/services/chatbot.service';

// Query keys for chatbot
export const chatbotKeys = {
  all: ['chatbot'] as const,
  conversation: () => [...chatbotKeys.all, 'conversation'] as const,
  history: () => [...chatbotKeys.all, 'history'] as const,
};

/**
 * Get conversation history with TanStack Query
 */
export const useChatHistory = () => {
  return useQuery({
    queryKey: chatbotKeys.history(),
    queryFn: () => chatbotService.getConversationHistory(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

/**
 * Send message mutation with optimistic updates
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: string) => chatbotService.sendMessage(message),
    
    // Optimistic update
    onMutate: async (messageText) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: chatbotKeys.history() });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<ChatMessage[]>(
        chatbotKeys.history()
      );

      // Optimistically add user message
      const optimisticUserMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        text: messageText,
        isUser: true,
        timestamp: new Date(),
      };

      queryClient.setQueryData<ChatMessage[]>(
        chatbotKeys.history(),
        (old = []) => [...old, optimisticUserMessage]
      );

      return { previousMessages };
    },

    // On success, replace optimistic message with real ones
    onSuccess: (response, messageText, context) => {
      queryClient.setQueryData<ChatMessage[]>(
        chatbotKeys.history(),
        (old = []) => {
          // Remove the optimistic message
          const withoutOptimistic = old.filter(
            msg => !msg.id.startsWith('temp-')
          );

          // Add real user and AI messages
          return [
            ...withoutOptimistic,
            {
              id: response.data.userMessage.message_id.toString(),
              text: response.data.userMessage.content,
              isUser: true,
              timestamp: new Date(response.data.userMessage.created_at),
            },
            {
              id: response.data.aiMessage.message_id.toString(),
              text: response.data.aiMessage.content,
              isUser: false,
              timestamp: new Date(response.data.aiMessage.created_at),
            },
          ];
        }
      );
    },

    // On error, rollback
    onError: (err, messageText, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          chatbotKeys.history(),
          context.previousMessages
        );
      }
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: chatbotKeys.history() });
    },
  });
};

/**
 * Clear conversation history mutation
 */
export const useClearHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => chatbotService.clearConversationHistory(),
    onSuccess: () => {
      // Clear the cache and set to welcome message
      queryClient.setQueryData<ChatMessage[]>(chatbotKeys.history(), [
        {
          id: 'welcome',
          text: "Hello! 👋 I'm your Craftopia AI assistant. I can help you with:\n\n• Creative craft ideas from recycled materials\n• Step-by-step crafting instructions\n• Tips for sustainable living\n• Guidance on eco-challenges\n\nWhat would you like to create today?",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    },
  });
};
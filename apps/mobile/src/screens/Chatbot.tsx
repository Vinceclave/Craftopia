import React, { useState, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, User, ArrowLeft, Sparkles } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { chatbotService, ChatMessage } from '~/services/chatbot.service';
import { useAlert } from '~/hooks/useAlert';

const INITIAL_MESSAGE: ChatMessage = {
  id: '1',
  text: "Hello! 👋 I'm your Craftopia AI assistant. I can help you with:\n\n• Creative craft ideas from recycled materials\n• Step-by-step crafting instructions\n• Tips for sustainable living\n• Guidance on eco-challenges\n\nWhat would you like to create today?",
  isUser: false,
  timestamp: new Date()
};

const SUGGESTED_PROMPTS = [
  "💡 Craft ideas with plastic bottles",
  "🎨 Easy beginner projects",
  "♻️ Best recycling practices",
  "🏆 Tell me about challenges"
];

export const ChatBotScreen = () => {
  const navigation = useNavigation();
  const { error } = useAlert();
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const sendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    scrollToBottom();

    try {
      const response = await chatbotService.sendMessage(
        messageText,
        messages
      );

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      scrollToBottom();
    } catch (err: any) {
      console.error('Chat error:', err);
      error('Error', err.message || 'Failed to get response. Please try again.');
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = (message: ChatMessage) => (
    <View
      key={message.id}
      className={`flex-row mb-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!message.isUser && (
        <View className="w-8 h-8 bg-craftopia-primary rounded-full items-center justify-center mr-2">
          <Bot size={16} color="white" />
        </View>
      )}
      
      <View
        className={`max-w-[75%] p-3 rounded-2xl ${
          message.isUser
            ? 'bg-craftopia-primary rounded-br-md'
            : 'bg-craftopia-light rounded-bl-md'
        }`}
      >
        <Text
          className={`text-sm leading-5 ${
            message.isUser ? 'text-white' : 'text-craftopia-textPrimary'
          }`}
        >
          {message.text}
        </Text>
        <Text
          className={`text-xs mt-1 ${
            message.isUser ? 'text-white/70' : 'text-craftopia-textSecondary'
          }`}
        >
          {message.timestamp.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
      
      {message.isUser && (
        <View className="w-8 h-8 bg-craftopia-accent rounded-full items-center justify-center ml-2">
          <User size={16} color="white" />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-craftopia-surface" edges={['left', 'right']}>
      {/* Header */}
      <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-8 h-8 bg-craftopia-light rounded-full items-center justify-center mr-3"
          >
            <ArrowLeft size={16} color="#004E98" />
          </TouchableOpacity>
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 bg-craftopia-primary rounded-full items-center justify-center mr-3">
              <Bot size={20} color="white" />
            </View>
            <View>
              <View className="flex-row items-center">
                <Text className="text-base font-semibold text-craftopia-textPrimary mr-1">
                  Craftopia AI
                </Text>
                <Sparkles size={14} color="#FFD700" />
              </View>
              <Text className="text-sm text-craftopia-textSecondary">
                {isTyping ? 'Typing...' : 'Online'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          {messages.map(renderMessage)}
          
          {/* Suggested Prompts (show only at start) */}
          {messages.length === 1 && !isTyping && (
            <View className="mt-4">
              <Text className="text-xs font-medium text-craftopia-textSecondary mb-2 uppercase">
                Try asking:
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => sendMessage(prompt)}
                    className="bg-craftopia-light px-3 py-2 rounded-full border border-craftopia-primary/20"
                  >
                    <Text className="text-xs text-craftopia-textPrimary">
                      {prompt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {/* Typing Indicator */}
          {isTyping && (
            <View className="flex-row justify-start mb-4">
              <View className="w-8 h-8 bg-craftopia-primary rounded-full items-center justify-center mr-2">
                <Bot size={16} color="white" />
              </View>
              <View className="bg-craftopia-light p-3 rounded-2xl rounded-bl-md">
                <View className="flex-row items-center gap-1">
                  <ActivityIndicator size="small" color="#004E98" />
                  <Text className="text-xs text-craftopia-textSecondary ml-2">
                    Thinking...
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View className="px-4 py-3 border-t border-craftopia-light bg-craftopia-surface">
          <View className="flex-row items-center">
            <View className="flex-1 bg-craftopia-light rounded-full px-4 py-3 mr-3">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask me about crafting ideas..."
                placeholderTextColor="#6B7280"
                className="text-craftopia-textPrimary text-sm"
                multiline
                maxLength={500}
                onSubmitEditing={() => sendMessage()}
                blurOnSubmit={false}
                editable={!isTyping}
              />
            </View>
            <TouchableOpacity
              onPress={() => sendMessage()}
              disabled={!inputText.trim() || isTyping}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                inputText.trim() && !isTyping
                  ? 'bg-craftopia-primary'
                  : 'bg-craftopia-light'
              }`}
            >
              <Send
                size={18}
                color={inputText.trim() && !isTyping ? 'white' : '#6B7280'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
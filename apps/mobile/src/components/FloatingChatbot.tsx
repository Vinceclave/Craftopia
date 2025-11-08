import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
  ActivityIndicator,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  KeyboardAvoidingView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Bot, User, Sparkles, Trash2, X } from 'lucide-react-native';
import { ChatMessage } from '~/services/chatbot.service';
import { useAlert } from '~/hooks/useAlert';
import { 
  useChatHistory, 
  useSendMessage, 
  useClearHistory 
} from '~/hooks/queries/useChatbot';

const SUGGESTED_PROMPTS = [
  "💡 Craft ideas with plastic bottles",
  "🎨 Easy beginner projects",
  "♻️ Best recycling practices",
  "🏆 Tell me about challenges"
];

interface FloatingChatbotProps {
  visible: boolean;
  onClose: () => void;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const { error, confirm } = useAlert();
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { 
    data: messages = [], 
    isLoading, 
    error: historyError 
  } = useChatHistory();

  const sendMessageMutation = useSendMessage();
  const clearHistoryMutation = useClearHistory();
  const isTyping = sendMessageMutation.isPending;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 10,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: Dimensions.get('window').height,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    if (visible && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, visible, scrollToBottom]);

  const sendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || isTyping) return;

    setInputText('');
    
    try {
      await sendMessageMutation.mutateAsync(messageText);
      scrollToBottom();
    } catch (err: any) {
      console.error('Chat error:', err);
      error('Error', err.message || 'Failed to send message. Please try again.');
    }
  };

  const handleClearHistory = () => {
    confirm(
      'Clear Conversation History',
      'Are you sure you want to clear all messages? This action cannot be undone.',
      async () => {
        try {
          await clearHistoryMutation.mutateAsync();
        } catch (err: any) {
          error('Error', 'Failed to clear conversation history');
        }
      }
    );
  };

  const renderMessage = (message: ChatMessage, index: number) => (
    <View
      key={`${message.id}-${index}`}
      className={`flex-row mb-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!message.isUser && (
        <View className="w-7 h-7 bg-craftopa-primary rounded-full items-center justify-center mr-2 shadow-sm border border-craftopa-light/10">
          <Bot size={14} color="white" />
        </View>
      )}
      
      <View
        className={`max-w-[80%] p-3 rounded-2xl shadow-sm border ${
          message.isUser 
            ? 'bg-craftopa-primary border-craftopa-primary/20' 
            : 'bg-white border-craftopa-light/5'
        } ${message.isUser ? 'rounded-br-md' : 'rounded-bl-md'}`}
      >
        <Text
          className={`text-sm leading-5 font-nunito ${
            message.isUser ? 'text-black' : 'text-craftopa-textPrimary'
          }`}
        >
          {message.text}
        </Text>
        <Text
          className={`text-xs mt-1 font-nunito ${
            message.isUser ? 'text-black/70' : 'text-craftopa-textSecondary'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
      
      {message.isUser && (
        <View className="w-7 h-7 bg-craftopa-accent rounded-full items-center justify-center ml-2 shadow-sm border border-craftopa-accent/20">
          <User size={14} color="white" />
        </View>
      )}
    </View>
  );

  if (!visible) {
    return null;
  }

  const screenHeight = Dimensions.get('window').height;
  const chatHeight = Platform.OS === 'web' ? '80%' : '85%';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1">
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'black',
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5]
              })
            }}
          />
        </TouchableWithoutFeedback>

        {/* Floating Chat Container */}
        <Animated.View
          className="absolute bottom-0 bg-white shadow-xl rounded-t-3xl"
          style={{
            position: 'absolute',
            bottom: 0,
            left: Platform.OS === 'web' ? '50%' : 0,
            right: Platform.OS === 'web' ? undefined : 0,
            width: Platform.OS === 'web' ? 450 : '100%',
            marginLeft: Platform.OS === 'web' ? -225 : 0,
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10,
            transform: Platform.OS === 'web' 
              ? [{ translateY: visible ? 0 : screenHeight }]
              : [{ translateY: slideAnim }],
            height: chatHeight,
            paddingTop: Math.max(insets.top, 20),
            paddingBottom: Math.max(insets.bottom, 10),
          }}
        >
          {/* Header */}
          <View className="px-4 py-3 border-b border-craftopa-light/10">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-craftopa-primary rounded-xl items-center justify-center mr-3 shadow-sm border border-craftopa-light/10">
                  <Bot size={20} color="white" />
                </View>
                <View>
                  <View className="flex-row items-center">
                    <Text className="text-lg font-poppinsBold text-craftopa-textPrimary mr-2 tracking-tight">
                      Craftopia AI
                    </Text>
                    <Sparkles size={16} color="#D4A96A" />
                  </View>
                  <Text className="text-sm font-nunito text-craftopa-textSecondary tracking-wide">
                    {isTyping ? 'Thinking...' : 'Ready to help'}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row gap-2">
                {messages.length > 1 && (
                  <TouchableOpacity
                    onPress={handleClearHistory}
                    disabled={clearHistoryMutation.isPending}
                    className="w-9 h-9 bg-craftopa-light/10 rounded-lg items-center justify-center active:opacity-70 border border-craftopa-light/10"
                    activeOpacity={0.7}
                  >
                    {clearHistoryMutation.isPending ? (
                      <ActivityIndicator size="small" color="#5A7160" />
                    ) : (
                      <Trash2 size={16} color="#5A7160" />
                    )}
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  onPress={onClose}
                  className="w-9 h-9 bg-craftopa-light/10 rounded-lg items-center justify-center active:opacity-70 border border-craftopa-light/10"
                  activeOpacity={0.7}
                >
                  <X size={16} color="#5A7160" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#5A7160" />
              <Text className="text-craftopa-textSecondary mt-3 text-sm font-nunito tracking-wide">
                Loading conversation...
              </Text>
            </View>
          ) : historyError ? (
            <View className="flex-1 justify-center items-center px-4">
              <Text className="text-craftopa-textPrimary text-base font-poppinsBold mb-2 tracking-tight">
                Failed to Load Conversation
              </Text>
              <Text className="text-craftopa-textSecondary text-sm font-nunito text-center tracking-wide">
                {historyError.message || 'Something went wrong'}
              </Text>
            </View>
          ) : (
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
                
                {messages.length <= 1 && !isTyping && (
                  <View className="mt-4">
                    <Text className="text-xs font-poppinsBold text-craftopa-textSecondary mb-3 tracking-wide uppercase">
                      Try asking:
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {SUGGESTED_PROMPTS.map((prompt, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => sendMessage(prompt)}
                          className="bg-white px-3 py-2 rounded-xl border border-craftopa-light/10 shadow-sm active:opacity-70"
                          activeOpacity={0.7}
                        >
                          <Text className="text-xs font-nunito text-craftopa-textPrimary tracking-wide">
                            {prompt}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
                
                {isTyping && (
                  <View className="flex-row justify-start mb-3">
                    <View className="w-7 h-7 bg-craftopa-primary rounded-full items-center justify-center mr-2 shadow-sm border border-craftopa-light/10">
                      <Bot size={14} color="white" />
                    </View>
                    <View className="bg-white p-3 rounded-2xl rounded-bl-md shadow-sm border border-craftopa-light/5">
                      <View className="flex-row items-center gap-2">
                        <ActivityIndicator size="small" color="#5A7160" />
                        <Text className="text-xs font-nunito text-craftopa-textSecondary tracking-wide">
                          Crafting response...
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Input */}
              <View className="px-4 py-3 border-t border-craftopa-light/10 bg-white">
                <View className="flex-row items-center">
                  <View className="flex-1 bg-craftopa-light/5 rounded-2xl px-4 py-3 mr-3 border border-craftopa-light/10">
                    <TextInput
                      value={inputText}
                      onChangeText={setInputText}
                      placeholder="Ask me about crafting ideas..."
                      placeholderTextColor="#9CA3AF"
                      className="text-craftopa-textPrimary text-sm font-nunito tracking-wide"
                      style={Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}}
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
                    className={`w-12 h-12 rounded-2xl items-center justify-center active:opacity-70 border ${
                      inputText.trim() && !isTyping 
                        ? 'bg-craftopa-primary border-craftopa-primary/20' 
                        : 'bg-craftopa-light/10 border-craftopa-light/10'
                    }`}
                    activeOpacity={0.8}
                  >
                    <Send
                      size={18}
                      color={inputText.trim() && !isTyping ? 'white' : '#9CA3AF'}
                    />
                  </TouchableOpacity>
                </View>
                {inputText.length > 0 && (
                  <Text className="text-xs font-nunito text-craftopa-textSecondary mt-2 text-center tracking-wide">
                    {500 - inputText.length} characters remaining
                  </Text>
                )}
              </View>
            </KeyboardAvoidingView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};


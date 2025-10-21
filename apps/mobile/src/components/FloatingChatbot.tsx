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
import { Send, Bot, User, Sparkles, Trash2, Minimize2 } from 'lucide-react-native';
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
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: Platform.OS !== 'web',
          tension: 65,
          friction: 10,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(slideAnim, {
          toValue: Dimensions.get('window').height,
          duration: 250,
          useNativeDriver: Platform.OS !== 'web',
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
      style={{
        flexDirection: 'row',
        marginBottom: 16,
        justifyContent: message.isUser ? 'flex-end' : 'flex-start'
      }}
    >
      {!message.isUser && (
        <View style={{
          width: 32,
          height: 32,
          backgroundColor: '#004E98',
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 8
        }}>
          <Bot size={16} color="white" />
        </View>
      )}
      
      <View
        style={{
          maxWidth: '75%',
          padding: 12,
          borderRadius: 16,
          backgroundColor: message.isUser ? '#004E98' : '#F3F4F6',
          borderBottomRightRadius: message.isUser ? 4 : 16,
          borderBottomLeftRadius: message.isUser ? 16 : 4,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            lineHeight: 20,
            color: message.isUser ? '#FFFFFF' : '#111827'
          }}
        >
          {message.text}
        </Text>
        <Text
          style={{
            fontSize: 12,
            marginTop: 4,
            color: message.isUser ? 'rgba(255,255,255,0.7)' : '#6B7280'
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
      
      {message.isUser && (
        <View style={{
          width: 32,
          height: 32,
          backgroundColor: '#10B981',
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 8
        }}>
          <User size={16} color="white" />
        </View>
      )}
    </View>
  );

  if (!visible) {
    return null;
  }

  const screenHeight = Dimensions.get('window').height;
  const chatHeight = Platform.OS === 'web' ? screenHeight * 0.75 : screenHeight * 0.85;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1 }}>
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
          <View style={{ 
            paddingHorizontal: 16, 
            paddingVertical: 12, 
            borderBottomWidth: 1, 
            borderBottomColor: '#E5E7EB' 
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{ 
                  width: 40, 
                  height: 40, 
                  backgroundColor: '#004E98', 
                  borderRadius: 20, 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginRight: 12 
                }}>
                  <Bot size={20} color="white" />
                </View>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginRight: 4 }}>
                      Craftopia AI
                    </Text>
                    <Sparkles size={14} color="#FFD700" />
                  </View>
                  <Text style={{ fontSize: 14, color: '#6B7280' }}>
                    {isTyping ? 'Typing...' : 'Online'}
                  </Text>
                </View>
              </View>
              
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {messages.length > 1 && (
                  <TouchableOpacity
                    onPress={handleClearHistory}
                    disabled={clearHistoryMutation.isPending}
                    style={{ 
                      width: 36, 
                      height: 36, 
                      backgroundColor: '#F3F4F6', 
                      borderRadius: 18, 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                    activeOpacity={0.7}
                  >
                    {clearHistoryMutation.isPending ? (
                      <ActivityIndicator size="small" color="#004E98" />
                    ) : (
                      <Trash2 size={16} color="#004E98" />
                    )}
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  onPress={onClose}
                  style={{ 
                    width: 36, 
                    height: 36, 
                    backgroundColor: '#F3F4F6', 
                    borderRadius: 18, 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                  activeOpacity={0.7}
                >
                  <Minimize2 size={16} color="#004E98" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {isLoading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#004E98" />
              <Text style={{ color: '#6B7280', marginTop: 8, fontSize: 14 }}>
                Loading conversation...
              </Text>
            </View>
          ) : historyError ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
              <Text style={{ color: '#111827', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                Failed to Load Conversation
              </Text>
              <Text style={{ color: '#6B7280', fontSize: 14, textAlign: 'center' }}>
                {historyError.message || 'Something went wrong'}
              </Text>
            </View>
          ) : (
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
              {/* Messages */}
              <ScrollView
                ref={scrollViewRef}
                style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 16 }}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={scrollToBottom}
              >
                {messages.map(renderMessage)}
                
                {messages.length <= 1 && !isTyping && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={{ 
                      fontSize: 12, 
                      fontWeight: '500', 
                      color: '#6B7280', 
                      marginBottom: 8, 
                      textTransform: 'uppercase' 
                    }}>
                      Try asking:
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {SUGGESTED_PROMPTS.map((prompt, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => sendMessage(prompt)}
                          style={{ 
                            backgroundColor: '#F3F4F6', 
                            paddingHorizontal: 12, 
                            paddingVertical: 8, 
                            borderRadius: 20, 
                            borderWidth: 1, 
                            borderColor: 'rgba(0, 78, 152, 0.2)' 
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={{ fontSize: 12, color: '#111827' }}>
                            {prompt}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
                
                {isTyping && (
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 16 }}>
                    <View style={{ 
                      width: 32, 
                      height: 32, 
                      backgroundColor: '#004E98', 
                      borderRadius: 16, 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      marginRight: 8 
                    }}>
                      <Bot size={16} color="white" />
                    </View>
                    <View style={{ 
                      backgroundColor: '#F3F4F6', 
                      padding: 12, 
                      borderRadius: 16, 
                      borderBottomLeftRadius: 4 
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <ActivityIndicator size="small" color="#004E98" />
                        <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 8 }}>
                          Thinking...
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Input */}
              <View style={{ 
                paddingHorizontal: 16, 
                paddingVertical: 12, 
                borderTopWidth: 1, 
                borderTopColor: '#E5E7EB', 
                backgroundColor: '#FFFFFF' 
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ 
                    flex: 1, 
                    backgroundColor: '#F3F4F6', 
                    borderRadius: 24, 
                    paddingHorizontal: 16, 
                    paddingVertical: 12, 
                    marginRight: 12 
                  }}>
                    <TextInput
                      value={inputText}
                      onChangeText={setInputText}
                      placeholder="Ask me about crafting ideas..."
                      placeholderTextColor="#6B7280"
                      style={{ color: '#111827', fontSize: 14, outlineStyle: 'none' } as any}
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
                    style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 24, 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: inputText.trim() && !isTyping ? '#004E98' : '#F3F4F6'
                    }}
                    activeOpacity={0.8}
                  >
                    <Send
                      size={18}
                      color={inputText.trim() && !isTyping ? 'white' : '#6B7280'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

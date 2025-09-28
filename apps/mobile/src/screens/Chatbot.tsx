import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, User, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const ChatBotScreen = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Craftopia AI assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(userMessage.text),
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1500);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('craft') || input.includes('diy')) {
      return 'I can help you with crafting ideas! What materials do you have available? I can suggest eco-friendly projects using recycled items.';
    } else if (input.includes('recycle') || input.includes('waste')) {
      return 'Great question about recycling! I can help you turn waste into wonderful crafts. What type of materials are you looking to recycle?';
    } else if (input.includes('challenge') || input.includes('quest')) {
      return 'Check out our Eco Quest section for exciting challenges! You can earn points by completing eco-friendly projects and helping the environment.';
    } else if (input.includes('help') || input.includes('how')) {
      return 'I\'m here to help! I can assist with:\n• Craft ideas and tutorials\n• Recycling tips\n• Eco challenges\n• Material suggestions\n\nWhat would you like to know?';
    } else {
      return 'That\'s interesting! I\'m here to help with crafting, recycling, and eco-friendly projects. Feel free to ask me anything related to creating amazing things from waste materials!';
    }
  };

  const renderMessage = (message: Message) => (
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
              <Text className="text-base font-semibold text-craftopia-textPrimary">
                Craftopia AI
              </Text>
              <Text className="text-sm text-craftopia-textSecondary">
                Your crafting assistant
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
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(renderMessage)}
          
          {isTyping && (
            <View className="flex-row justify-start mb-4">
              <View className="w-8 h-8 bg-craftopia-primary rounded-full items-center justify-center mr-2">
                <Bot size={16} color="white" />
              </View>
              <View className="bg-craftopia-light p-3 rounded-2xl rounded-bl-md">
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-craftopia-textSecondary rounded-full mr-1 opacity-60" />
                  <View className="w-2 h-2 bg-craftopia-textSecondary rounded-full mr-1 opacity-60" />
                  <View className="w-2 h-2 bg-craftopia-textSecondary rounded-full opacity-60" />
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
                onSubmitEditing={sendMessage}
                blurOnSubmit={false}
              />
            </View>
            <TouchableOpacity
              onPress={sendMessage}
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
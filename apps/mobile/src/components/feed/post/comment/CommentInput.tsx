// apps/mobile/src/components/feed/comment/CommentInput.tsx - FIXED
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Send, User } from 'lucide-react-native';

interface CommentInputProps {
  onSend: (content: string) => Promise<void>;
  submitting?: boolean;
}

export const CommentInput: React.FC<CommentInputProps> = ({ onSend, submitting = false }) => {
  const [text, setText] = useState('');

  const handleSend = async () => {
    if (!text.trim() || submitting) return;
    try {
      await onSend(text.trim());
      setText('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View className="border-t border-gray-200 px-5 py-4 bg-white">
      <View className="flex-row items-end gap-3">
        <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center">
          <User size={16} color="#6B7280" />
        </View>
        <View className="flex-1 bg-gray-100 rounded-2xl px-4 py-3">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Write a comment..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
            className="text-gray-900 text-base"
            style={{ minHeight: 20, maxHeight: 80 }}
            editable={!submitting}
          />
        </View>
        <TouchableOpacity
          onPress={handleSend}
          disabled={!text.trim() || submitting}
          className={`w-10 h-10 rounded-xl items-center justify-center ${
            text.trim() && !submitting ? 'bg-gray-900' : 'bg-gray-300'
          }`}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Send size={18} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
      {text.length > 400 && (
        <View className="ml-11 mt-2">
          <Text className="text-xs text-gray-500">
            {500 - text.length} characters left
          </Text>
        </View>
      )}
    </View>
  );
};
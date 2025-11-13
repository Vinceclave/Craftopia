// apps/mobile/src/components/feed/comment/CommentInput.tsx - CRAFTOPIA REDESIGN
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
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
    <View className="border-t border-craftopa-light/10 px-5 py-4 bg-white">
      <View className="flex-row items-end gap-3">
        <View className="w-8 h-8 bg-craftopa-light/5 rounded-full items-center justify-center border border-craftopa-light/10">
          <User size={16} color="#5A7160" />
        </View>
        <View className="flex-1 bg-craftopa-light/5 rounded-2xl px-4 py-3 border border-craftopa-light/10">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Write a comment..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
            className="text-craftopa-textPrimary text-base font-nunito tracking-wide"
            style={{ minHeight: 20, maxHeight: 80 }}
            editable={!submitting}
          />
        </View>
        <TouchableOpacity
          onPress={handleSend}
          disabled={!text.trim() || submitting}
          className={`w-10 h-10 rounded-xl items-center justify-center border active:opacity-70 ${
            text.trim() && !submitting 
              ? 'bg-craftopa-primary border-craftopa-primary/20' 
              : 'bg-craftopa-light/10 border-craftopa-light/20'
          }`}
          activeOpacity={0.7}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Send size={18} color={text.trim() && !submitting ? "#FFFFFF" : "#9CA3AF"} />
          )}
        </TouchableOpacity>
      </View>
      {text.length > 400 && (
        <View className="ml-11 mt-2">
          <Text className="text-xs text-craftopa-textSecondary font-nunito tracking-wide">
            {500 - text.length} characters left
          </Text>
        </View>
      )}
    </View>
  );
};
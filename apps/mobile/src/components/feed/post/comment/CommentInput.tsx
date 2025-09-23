import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, Image, Text } from 'react-native';
import { Send } from 'lucide-react-native';

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
    <View className="border-t border-craftopia-light px-4 py-3 bg-craftopia-surface">
      <View className="flex-row items-center gap-2">
        <Image source={{ uri: 'https://i.pravatar.cc/32?u=current_user' }} className="w-7 h-7 rounded-full" />
        <View className="flex-1 bg-craftopia-light rounded-xl px-3 py-1.5 max-h-20">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Write a comment..."
            multiline
            maxLength={500}
            className="text-sm text-craftopia-textPrimary"
            style={{ minHeight: 20, maxHeight: 60 }}
            editable={!submitting}
          />
        </View>
        <TouchableOpacity
          onPress={handleSend}
          disabled={!text.trim() || submitting}
          className={`w-9 h-9 rounded-full items-center justify-center ${
            text.trim() && !submitting ? 'bg-craftopia-primary' : 'bg-gray-300'
          }`}
          activeOpacity={0.8}
        >
          {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Send size={16} color="#fff" />}
        </TouchableOpacity>
      </View>
      {text.length > 400 && (
        <Text className="text-xs text-craftopia-textSecondary mt-1 ml-10">{500 - text.length} characters left</Text>
      )}
    </View>
  );
};
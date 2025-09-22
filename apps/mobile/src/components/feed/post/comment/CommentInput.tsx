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
    if (!text.trim()) return;
    await onSend(text.trim());
    setText('');
  };

  return (
    <View className="border-t border-gray-200 px-4 py-3">
      <View className="flex-row items-end space-x-3">
        <Image source={{ uri: 'https://i.pravatar.cc/32?u=current_user' }} className="w-8 h-8 rounded-full" />
        <View className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 max-h-24">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Write a comment..."
            multiline
            maxLength={500}
            className="text-sm text-gray-900"
            style={{ minHeight: 20, maxHeight: 80 }}
          />
        </View>
        <TouchableOpacity
          onPress={handleSend}
          disabled={!text.trim() || submitting}
          className={`w-10 h-10 rounded-full items-center justify-center ${
            text.trim() && !submitting ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Send size={18} color="#fff" />}
        </TouchableOpacity>
      </View>
      {text.length > 400 && <Text className="text-xs text-gray-500 mt-1 ml-11">{500 - text.length} characters remaining</Text>}
    </View>
  );
};

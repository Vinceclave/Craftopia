// apps/mobile/src/components/feed/post/comment/CommentInput.tsx - WITH PROFILE PHOTO
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Send } from 'lucide-react-native';
import { useProfile } from '~/hooks/useProfile';

interface CommentInputProps {
  onSend: (content: string) => Promise<void>;
  submitting?: boolean;
}

export const CommentInput: React.FC<CommentInputProps> = ({ onSend, submitting = false }) => {
  const [text, setText] = useState('');
  const [imageError, setImageError] = useState(false);
  const { profile } = useProfile();
  
  const profilePicture = profile?.profile?.profile_picture_url;
  const isEmoji = profilePicture && profilePicture.length <= 2 && !profilePicture.startsWith('http');

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
      <View className="flex-row items-end gap-2">
        {/* Current User Profile Picture */}
        <View className="w-8 h-8 bg-craftopia-light rounded-full items-center justify-center border border-craftopia-light overflow-hidden">
          {isEmoji || !profilePicture || imageError ? (
            <Text className="text-sm">{isEmoji ? profilePicture : '🧑‍🎨'}</Text>
          ) : (
            <Image
              source={{ uri: profilePicture }}
              className="w-full h-full"
              resizeMode="cover"
              onError={(e) => {
                console.error('CommentInput image error:', e.nativeEvent.error);
                setImageError(true);
              }}
            />
          )}
        </View>
        
        <View className="flex-1 bg-craftopia-light rounded-lg px-3 py-2 border border-craftopia-light">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Write a comment..."
            placeholderTextColor="#5F6F64"
            multiline
            maxLength={500}
            className="text-craftopia-textPrimary text-sm font-nunito"
            style={{ minHeight: 20, maxHeight: 80 }}
            editable={!submitting}
          />
        </View>
        
        <TouchableOpacity
          onPress={handleSend}
          disabled={!text.trim() || submitting}
          className={`w-9 h-9 rounded-lg items-center justify-center border active:opacity-70 ${
            text.trim() && !submitting 
              ? 'bg-craftopia-primary border-craftopia-primary' 
              : 'bg-craftopia-light border-craftopia-light'
          }`}
          activeOpacity={0.7}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Send size={16} color={text.trim() && !submitting ? "#FFFFFF" : "#5F6F64"} />
          )}
        </TouchableOpacity>
      </View>
      
      {text.length > 400 && (
        <View className="ml-10 mt-1">
          <Text className="text-xs text-craftopia-textSecondary font-nunito">
            {500 - text.length} characters left
          </Text>
        </View>
      )}
    </View>
  );
};
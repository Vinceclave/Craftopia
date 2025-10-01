import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Heart, MessageCircle } from 'lucide-react-native';

interface PostActionsProps {
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  onToggleReaction?: () => void;
  onOpenComments?: () => void;
}

export const PostActions: React.FC<PostActionsProps> = memo(({ 
  likeCount, 
  commentCount, 
  isLiked, 
  onToggleReaction, 
  onOpenComments 
}) => (
  <View className="flex-row items-center justify-start gap-4 mt-2">
    <TouchableOpacity 
      className="flex-row items-center" 
      onPress={onToggleReaction}
      activeOpacity={0.7}
    >
      <Heart 
        size={14} 
        color={isLiked ? '#D4A96A' : '#5D6B5D'} 
        fill={isLiked ? '#D4A96A' : 'transparent'} 
      />
      <Text className="ml-1 text-xs text-craftopia-textSecondary">
        {likeCount}
      </Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      className="flex-row items-center" 
      onPress={onOpenComments}
      activeOpacity={0.7}
    >
      <MessageCircle size={14} color="#5D6B5D" />
      <Text className="ml-1 text-xs text-craftopia-textSecondary">
        {commentCount}
      </Text>
    </TouchableOpacity>
  </View>
));
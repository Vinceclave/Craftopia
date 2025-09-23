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

export const PostActions: React.FC<PostActionsProps> = memo(({ likeCount, commentCount, isLiked, onToggleReaction, onOpenComments }) => (
  <View className="flex-row items-center justify-start gap-3 mt-2">
    <TouchableOpacity className="flex-row items-center" onPress={onToggleReaction}>
      <Heart size={14} color={isLiked ? '#FF6700' : '#6B7280'} fill={isLiked ? '#FF6700' : 'transparent'} />
      <Text className="ml-1 text-xs text-craftopia-textSecondary">{likeCount}</Text>
    </TouchableOpacity>
    <TouchableOpacity className="flex-row items-center" onPress={onOpenComments}>
      <MessageCircle size={14} color="#6B7280" />
      <Text className="ml-1 text-xs text-craftopia-textSecondary">{commentCount}</Text>
    </TouchableOpacity>
  </View>
));

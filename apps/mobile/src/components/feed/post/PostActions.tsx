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
  <View className="flex-row items-center justify-start gap-2  mt-2">
    <TouchableOpacity className="flex-row items-center" onPress={onToggleReaction}>
      <Heart size={16} color={isLiked ? '#10B981' : '#6B7280'} />
      <Text className="ml-1 text-sm text-craftopia-textSecondary">{likeCount}</Text>
    </TouchableOpacity>
    <TouchableOpacity className="flex-row items-center" onPress={onOpenComments}>
      <MessageCircle size={16} color="#6B7280" />
      <Text className="ml-1 text-sm text-craftopia-textSecondary">{commentCount}</Text>
    </TouchableOpacity>
  </View>
));

// apps/mobile/src/components/feed/post/PostActions.tsx - UPDATED WITH SHARE
import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';

interface PostActionsProps {
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  onToggleReaction?: () => void;
  onOpenComments?: () => void;
  onShare?: () => void;  // NEW: Share handler
}

export const PostActions: React.FC<PostActionsProps> = memo(({ 
  likeCount = 0, 
  commentCount = 0, 
  isLiked = false, 
  onToggleReaction, 
  onOpenComments,
  onShare  // NEW: Share prop
}) => (
  <View className="flex-row items-center justify-start gap-4 mt-2">
    {/* Like Button */}
    <TouchableOpacity 
      className="flex-row items-center" 
      onPress={onToggleReaction}
      activeOpacity={0.7}
      disabled={!onToggleReaction}
    >
      <Heart 
        size={18} 
        color={isLiked ? '#D4A96A' : '#5D6B5D'} 
        fill={isLiked ? '#D4A96A' : 'transparent'} 
      />
      <Text className="ml-1.5 text-sm text-craftopia-textSecondary">
        {likeCount}
      </Text>
    </TouchableOpacity>
    
    {/* Comment Button */}
    <TouchableOpacity 
      className="flex-row items-center" 
      onPress={onOpenComments}
      activeOpacity={0.7}
      disabled={!onOpenComments}
    >
      <MessageCircle size={18} color="#5D6B5D" />
      <Text className="ml-1.5 text-sm text-craftopia-textSecondary">
        {commentCount}
      </Text>
    </TouchableOpacity>

    {/* Share Button - NEW */}
    {onShare && (
      <TouchableOpacity 
        className="flex-row items-center" 
        onPress={onShare}
        activeOpacity={0.7}
      >
        <Share2 size={18} color="#5D6B5D" />
        <Text className="ml-1.5 text-sm text-craftopia-textSecondary">
          Share
        </Text>
      </TouchableOpacity>
    )}
  </View>
));

PostActions.displayName = 'PostActions';
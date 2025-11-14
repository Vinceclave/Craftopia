// apps/mobile/src/components/feed/post/PostActions.tsx - CRAFTOPIA REFINED
import React, { memo, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';

interface PostActionsProps {
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  onToggleReaction?: () => void;
  onOpenComments?: () => void;
  onShare?: () => void;
}

export const PostActions: React.FC<PostActionsProps> = memo(({ 
  likeCount = 0, 
  commentCount = 0, 
  isLiked = false, 
  onToggleReaction, 
  onOpenComments,
  onShare
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));

  const handleLikePress = () => {
    // Micro-interaction animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    onToggleReaction?.();
  };

  return (
    <View className="flex-row items-center justify-between px-1 py-3">
      {/* Left Section - Like & Comment */}
      <View className="flex-row items-center gap-4">
        {/* Like Button */}
        <TouchableOpacity 
          className="flex-row items-center gap-1.5 active:opacity-70"
          onPress={handleLikePress}
          activeOpacity={0.7}
          disabled={!onToggleReaction}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Heart 
              size={18} 
              color={isLiked ? '#D66B4E' : '#3B6E4D'} 
              fill={isLiked ? '#D66B4E' : 'transparent'} 
            />
          </Animated.View>
          <Text className={`text-sm font-poppinsBold ${
            isLiked ? 'text-craftopia-error' : 'text-craftopia-textSecondary'
          }`}>
            {likeCount}
          </Text>
        </TouchableOpacity>
        
        {/* Comment Button */}
        <TouchableOpacity 
          className="flex-row items-center gap-1.5 active:opacity-70"
          onPress={onOpenComments}
          activeOpacity={0.7}
          disabled={!onOpenComments}
        >
          <MessageCircle 
            size={18} 
            color="#3B6E4D" 
          />
          <Text className="text-sm font-poppinsBold text-craftopia-textSecondary">
            {commentCount}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Right Section - Share */}
      {onShare && (
        <TouchableOpacity 
          className="flex-row items-center gap-1.5 active:opacity-70"
          onPress={onShare}
          activeOpacity={0.7}
        >
          <Share2 
            size={16} 
            color="#3B6E4D" 
          />
          <Text className="text-sm font-poppinsBold text-craftopia-textSecondary">
            Share
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

PostActions.displayName = 'PostActions';
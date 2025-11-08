// apps/mobile/src/components/feed/post/PostActions.tsx - MODERN MINIMALISTIC REDESIGN
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
      <View className="flex-row items-center gap-6">
        {/* Like Button */}
        <TouchableOpacity 
          className="flex-row items-center gap-2"
          onPress={handleLikePress}
          activeOpacity={0.6}
          disabled={!onToggleReaction}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Heart 
              size={20} 
              color={isLiked ? '#EF4444' : '#6B7280'} 
              fill={isLiked ? '#EF4444' : 'transparent'} 
              strokeWidth={isLiked ? 2.5 : 1.5}
            />
          </Animated.View>
          <Text className={`text-sm font-medium ${
            isLiked ? 'text-red-500' : 'text-gray-500'
          }`}>
            {likeCount}
          </Text>
        </TouchableOpacity>
        
        {/* Comment Button */}
        <TouchableOpacity 
          className="flex-row items-center gap-2"
          onPress={onOpenComments}
          activeOpacity={0.6}
          disabled={!onOpenComments}
        >
          <MessageCircle 
            size={20} 
            color="#6B7280" 
            strokeWidth={1.5}
          />
          <Text className="text-sm font-medium text-gray-500">
            {commentCount}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Right Section - Share */}
      {onShare && (
        <TouchableOpacity 
          className="flex-row items-center gap-2"
          onPress={onShare}
          activeOpacity={0.6}
        >
          <Share2 
            size={18} 
            color="#6B7280" 
            strokeWidth={1.5}
          />
          <Text className="text-sm font-medium text-gray-500">
            Share
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

PostActions.displayName = 'PostActions';
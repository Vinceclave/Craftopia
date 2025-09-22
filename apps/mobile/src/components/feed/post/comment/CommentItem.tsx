import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Heart } from 'lucide-react-native';
import { formatTimeAgo } from './utils';
import { Comment } from '../type';

interface CommentItemProps {
  comment: Comment;
  onToggleReaction: (commentId: number) => void;
}

export const CommentItem: React.FC<CommentItemProps> = memo(
  ({ comment, onToggleReaction }) => (
    <View className="flex-row mb-4">
      <Image
        source={{ uri: `https://i.pravatar.cc/32?u=${comment.user.user_id}` }}
        className="w-8 h-8 rounded-full mr-3"
      />
      <View className="flex-1">
        <View className="bg-gray-50 rounded-2xl px-3 py-2 mb-1">
          <Text className="font-medium text-gray-900 text-sm mb-1">
            {comment.user.username}
          </Text>
          <Text className="text-gray-700 text-sm leading-5">{comment.content}</Text>
        </View>
        <View className="flex-row items-center ml-3">
          <Text className="text-xs text-gray-500 mr-4">{formatTimeAgo(comment.created_at)}</Text>
          <TouchableOpacity 
            onPress={() => onToggleReaction(comment.comment_id)} 
            className="flex-row items-center"
            activeOpacity={0.7}
          >
            <Heart 
              size={14} 
              color={comment.isLiked ? '#EF4444' : '#9CA3AF'} 
              fill={comment.isLiked ? '#EF4444' : 'none'} 
            />
            {comment.likeCount > 0 && (
              <Text className="text-xs text-gray-500 ml-1">{comment.likeCount}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
);
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
    <View className="flex-row mb-3">
      <Image
        source={{ uri: `https://i.pravatar.cc/32?u=${comment.user.user_id}` }}
        className="w-7 h-7 rounded-full mr-2"
      />
      <View className="flex-1">
        <View className="bg-craftopia-light rounded-xl px-3 py-2 mb-1">
          <Text className="font-medium text-craftopia-textPrimary text-sm mb-0.5">
            {comment.user.username}
          </Text>
          <Text className="text-craftopia-textSecondary text-sm leading-5">{comment.content}</Text>
        </View>
        <View className="flex-row items-center ml-2">
          <Text className="text-xs text-craftopia-textSecondary mr-3">{formatTimeAgo(comment.created_at)}</Text>
          <TouchableOpacity onPress={() => onToggleReaction(comment.comment_id)} className="flex-row items-center" activeOpacity={0.8}>
            <Heart size={12} color={comment.isLiked ? '#FF6700' : '#6B7280'} fill={comment.isLiked ? '#FF6700' : 'none'} />
            {comment.likeCount > 0 && (
              <Text className="text-xs text-craftopia-textSecondary ml-0.5">{comment.likeCount}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
);
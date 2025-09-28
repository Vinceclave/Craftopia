import React, { memo } from 'react';
import { View, Text, Image } from 'react-native';
import { formatTimeAgo } from '~/utils/time';
import { Comment } from '~/hooks/queries/usePosts';

interface CommentItemProps {
  comment: Comment;
}

export const CommentItem: React.FC<CommentItemProps> = memo(({ comment }) => (
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
        <Text className="text-xs text-craftopia-textSecondary">{formatTimeAgo(comment.created_at)}</Text>
      </View>
    </View>
  </View>
));
// apps/mobile/src/components/feed/comment/CommentItem.tsx - FIXED
import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { User } from 'lucide-react-native';
import { formatTimeAgo } from '~/utils/time';
import { Comment } from '~/hooks/queries/usePosts';

interface CommentItemProps {
  comment: Comment;
}

export const CommentItem: React.FC<CommentItemProps> = memo(({ comment }) => (
  <View className="flex-row mb-4">
    <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center mr-3">
      <User size={16} color="#6B7280" />
    </View>
    <View className="flex-1">
      <View className="bg-gray-100 rounded-2xl px-4 py-3 mb-2">
        <Text className="font-semibold text-gray-900 text-sm mb-1">
          {comment.user.username}
        </Text>
        <Text className="text-gray-700 text-base leading-6">{comment.content}</Text>
      </View>
      <View className="flex-row items-center ml-1">
        <Text className="text-xs text-gray-500">{formatTimeAgo(comment.created_at)}</Text>
      </View>
    </View>
  </View>
));

CommentItem.displayName = 'CommentItem';
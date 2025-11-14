// apps/mobile/src/components/feed/comment/CommentItem.tsx - CRAFTOPIA REFINED
import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { User } from 'lucide-react-native';
import { formatTimeAgo } from '~/utils/time';
import { Comment } from '~/hooks/queries/usePosts';

interface CommentItemProps {
  comment: Comment;
}

export const CommentItem: React.FC<CommentItemProps> = memo(({ comment }) => (
  <View className="flex-row mb-3">
    <View className="w-8 h-8 bg-craftopia-light rounded-full items-center justify-center mr-2 border border-craftopia-light">
      <User size={14} color="#3B6E4D" />
    </View>
    <View className="flex-1">
      <View className="bg-craftopia-surface rounded-lg px-3 py-2 mb-1 border border-craftopia-light">
        <Text className="font-poppinsBold text-craftopia-textPrimary text-sm mb-0.5">
          {comment.user.username}
        </Text>
        <Text className="text-craftopia-textSecondary text-sm leading-5 font-nunito">
          {comment.content}
        </Text>
      </View>
      <View className="flex-row items-center ml-1">
        <Text className="text-xs text-craftopia-textSecondary font-nunito">
          {formatTimeAgo(comment.created_at)}
        </Text>
      </View>
    </View>
  </View>
));

CommentItem.displayName = 'CommentItem';
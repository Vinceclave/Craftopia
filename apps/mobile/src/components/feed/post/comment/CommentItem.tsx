// apps/mobile/src/components/feed/comment/CommentItem.tsx - CRAFTOPIA REDESIGN
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
    <View className="w-8 h-8 bg-craftopa-light/5 rounded-full items-center justify-center mr-3 border border-craftopa-light/10">
      <User size={16} color="#5A7160" />
    </View>
    <View className="flex-1">
      <View className="bg-white rounded-2xl px-4 py-3 mb-2 border border-craftopa-light/10 shadow-sm">
        <Text className="font-poppinsBold text-craftopa-textPrimary text-sm mb-1 tracking-tight">
          {comment.user.username}
        </Text>
        <Text className="text-craftopa-textSecondary text-base leading-6 font-nunito tracking-wide">
          {comment.content}
        </Text>
      </View>
      <View className="flex-row items-center ml-1">
        <Text className="text-xs text-craftopa-textSecondary font-nunito tracking-wide">
          {formatTimeAgo(comment.created_at)}
        </Text>
      </View>
    </View>
  </View>
));

CommentItem.displayName = 'CommentItem';
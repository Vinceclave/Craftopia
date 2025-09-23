import React, { memo } from 'react';
import { View, Text, Image } from 'react-native';
import type { User } from './type';
import { formatTimeAgo } from '~/utils/time';

interface PostHeaderProps {
  user: User;
  featured?: boolean;
  created_at?: string | null;
}

export const PostHeader: React.FC<PostHeaderProps> = memo(({ user, featured, created_at }) => (
  <View className="flex-row items-center mb-2">
    <Image
      source={{ uri: `https://i.pravatar.cc/32?u=${user.user_id}` }}
      className="w-7 h-7 rounded-full"
    />
    <View className="flex-1 ml-2">
      <Text className="font-medium text-craftopia-textPrimary text-sm">{user.username}</Text>
      <Text className="text-xs text-craftopia-textSecondary">{formatTimeAgo(created_at)}</Text>
    </View>
    {featured && <View className="w-1.5 h-1.5 bg-craftopia-accent rounded-full" />}
  </View>
));

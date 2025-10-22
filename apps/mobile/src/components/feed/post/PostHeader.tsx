// PostHeader.tsx
import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { User } from './type';
import { formatTimeAgo } from '~/utils/time';

interface PostHeaderProps {
  user?: User | null;
  featured?: boolean;
  created_at?: string | null;
  onOptionsPress?: () => void; // <-- new
}

export const PostHeader: React.FC<PostHeaderProps> = memo(({ 
  user, 
  featured, 
  created_at,
  onOptionsPress
}) => {
  const username = user?.username || 'Unknown User';
  const userId = user?.user_id || 0;

  return (
    <View className="flex-row items-center justify-between mb-3">
      <View className="flex-row items-center flex-1">
        <Image
          source={{ uri: `https://i.pravatar.cc/32?u=${userId}` }}
          className="w-8 h-8 rounded-full"
        />
        <View className="flex-1 ml-2">
          <Text className="font-medium text-craftopia-textPrimary text-sm">
            {username}
          </Text>
          <Text className="text-xs text-craftopia-textSecondary">
            {formatTimeAgo(created_at)}
          </Text>
        </View>
      </View>

      {featured && (
        <View className="bg-craftopia-accent/20 rounded-full px-2 py-1 mr-2">
          <Text className="text-xs font-medium text-craftopia-accent">
            Featured
          </Text>
        </View>
      )}

      {onOptionsPress && (
        <TouchableOpacity onPress={onOptionsPress}>
          <Ionicons name="ellipsis-vertical" size={20} color="gray" />
        </TouchableOpacity>
      )}
    </View>
  );
});

PostHeader.displayName = 'PostHeader';

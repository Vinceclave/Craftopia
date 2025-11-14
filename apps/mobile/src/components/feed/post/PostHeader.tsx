// apps/mobile/src/components/feed/post/PostHeader.tsx - CRAFTOPIA REFINED
import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MoreHorizontal, Sparkles } from 'lucide-react-native';
import type { User } from './type';
import { formatTimeAgo } from '~/utils/time';

interface PostHeaderProps {
  user?: User | null;
  featured?: boolean;
  created_at?: string | null;
  onOptionsPress?: () => void;
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
          className="w-8 h-8 rounded-lg border border-craftopia-light"
        />
        <View className="flex-1 ml-2">
          <Text className="font-poppinsBold text-craftopia-textPrimary text-sm">
            {username}
          </Text>
          <Text className="text-xs font-nunito text-craftopia-textSecondary">
            {formatTimeAgo(created_at)}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-1.5">
        {featured && (
          <View className="bg-craftopia-warning/10 rounded-md px-2 py-1 border border-craftopia-warning/20">
            <View className="flex-row items-center gap-1">
              <Sparkles size={12} color="#E3A84F" />
              <Text className="text-xs font-poppinsBold text-craftopia-warning">
                Featured
              </Text>
            </View>
          </View>
        )}

        {onOptionsPress && (
          <TouchableOpacity 
            onPress={onOptionsPress}
            className="w-8 h-8 rounded-lg items-center justify-center active:opacity-70 bg-craftopia-light"
            activeOpacity={0.7}
          >
            <MoreHorizontal size={16} color="#3B6E4D" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

PostHeader.displayName = 'PostHeader';
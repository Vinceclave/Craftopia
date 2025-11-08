// apps/mobile/src/components/feed/post/PostHeader.tsx - CRAFTOPIA REDESIGN
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
    <View className="flex-row items-center justify-between mb-4">
      <View className="flex-row items-center flex-1">
        <Image
          source={{ uri: `https://i.pravatar.cc/32?u=${userId}` }}
          className="w-9 h-9 rounded-xl border border-craftopa-light/10"
        />
        <View className="flex-1 ml-3">
          <Text className="font-poppinsBold text-craftopa-textPrimary text-sm tracking-tight">
            {username}
          </Text>
          <Text className="text-xs font-nunito text-craftopa-textSecondary tracking-wide">
            {formatTimeAgo(created_at)}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        {featured && (
          <View className="bg-craftopa-accent/10 rounded-lg px-2.5 py-1 border border-craftopa-accent/20">
            <View className="flex-row items-center gap-1">
              <Sparkles size={12} color="#D4A96A" />
              <Text className="text-xs font-poppinsBold text-craftopa-accent tracking-tight">
                Featured
              </Text>
            </View>
          </View>
        )}

        {onOptionsPress && (
          <TouchableOpacity 
            onPress={onOptionsPress}
            className="w-8 h-8 rounded-lg items-center justify-center active:opacity-70 bg-craftopa-light/5 border border-craftopa-light/10"
            activeOpacity={0.7}
          >
            <MoreHorizontal size={16} color="#5A7160" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

PostHeader.displayName = 'PostHeader';
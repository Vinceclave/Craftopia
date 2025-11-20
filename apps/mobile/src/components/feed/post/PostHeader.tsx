// apps/mobile/src/components/feed/post/PostHeader.tsx - WITH REAL PROFILE PHOTOS
import React, { memo, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MoreHorizontal, Sparkles, User } from 'lucide-react-native';
import type { User as UserType } from './type';
import { formatTimeAgo } from '~/utils/time';

interface PostHeaderProps {
  user?: UserType | null;
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
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const username = user?.username || 'Unknown User';
  const userId = user?.user_id || 0;
  const profilePicture = user?.profile_picture_url;
  
  // Check if it's an emoji (1-2 characters, not a URL)
  const isEmoji = profilePicture && profilePicture.length <= 2 && !profilePicture.startsWith('http');

  return (
    <View className="flex-row items-center justify-between mb-3">
      <View className="flex-row items-center flex-1">
        {/* Profile Picture */}
        <View className="w-8 h-8 rounded-lg border border-craftopia-light overflow-hidden bg-craftopia-light items-center justify-center">
          {isEmoji || !profilePicture || imageError ? (
            <Text className="text-base">{isEmoji ? profilePicture : '🧑‍🎨'}</Text>
          ) : (
            <>
              {imageLoading && (
                <ActivityIndicator size="small" color="#3B6E4D" />
              )}
              <Image
                source={{ uri: profilePicture }}
                className="w-full h-full"
                resizeMode="cover"
                onLoad={() => setImageLoading(false)}
                onError={(e) => {
                  console.error('PostHeader image error:', e.nativeEvent.error);
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
            </>
          )}
        </View>
        
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
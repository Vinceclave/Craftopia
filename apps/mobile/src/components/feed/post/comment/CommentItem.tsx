// apps/mobile/src/components/feed/post/comment/CommentItem.tsx - WITH REAL PROFILE PHOTOS
import React, { memo, useState } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import { formatTimeAgo } from '~/utils/time';
import { Comment } from '~/hooks/queries/usePosts';

interface CommentItemProps {
  comment: Comment;
}

export const CommentItem: React.FC<CommentItemProps> = memo(({ comment }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const profilePicture = comment.user?.profile_picture_url;
  const isEmoji = profilePicture && profilePicture.length <= 2 && !profilePicture.startsWith('http');

  return (
    <View className="flex-row mb-3">
      {/* Profile Picture */}
      <View className="w-8 h-8 bg-craftopia-light rounded-full items-center justify-center mr-2 border border-craftopia-light overflow-hidden">
        {isEmoji || !profilePicture || imageError ? (
          <Text className="text-sm">{isEmoji ? profilePicture : '🧑‍🎨'}</Text>
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
                console.error('CommentItem image error:', e.nativeEvent.error);
                setImageLoading(false);
                setImageError(true);
              }}
            />
          </>
        )}
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
  );
});

CommentItem.displayName = 'CommentItem';
// apps/mobile/src/components/feed/FeedListFooter.tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface FeedListFooterProps {
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  postsCount: number;
}

export const FeedListFooter: React.FC<FeedListFooterProps> = ({
  isFetchingNextPage,
  hasNextPage,
  postsCount,
}) => {
  if (isFetchingNextPage) {
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#374A36" />
        <Text className="text-craftopia-textSecondary text-xs mt-2">
          Loading more posts...
        </Text>
      </View>
    );
  }

  if (!hasNextPage && postsCount > 0) {
    return (
      <View className="py-6 items-center">
        <Text className="text-craftopia-textSecondary text-xs">
          🎉 You've reached the end!
        </Text>
      </View>
    );
  }

  return null;
};
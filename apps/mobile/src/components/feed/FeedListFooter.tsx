import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Sparkles } from 'lucide-react-native';

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
        <ActivityIndicator size="small" color="#5A7160" />
        <Text className="text-craftopa-textSecondary text-xs mt-1 font-nunito tracking-wide">
          Loading more...
        </Text>
      </View>
    );
  }

  if (!hasNextPage && postsCount > 0) {
    return (
      <View className="py-4 items-center">
        <View className="flex-row items-center gap-1.5">
          <Sparkles size={12} color="#D4A96A" />
          <Text className="text-craftopa-textSecondary text-xs font-nunito tracking-wide">
            You've reached the end!
          </Text>
        </View>
      </View>
    );
  }

  return null;
};
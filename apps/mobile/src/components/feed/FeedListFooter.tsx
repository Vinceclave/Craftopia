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
      <View className="py-3 items-center">
        <ActivityIndicator size="small" color="#3B6E4D" />
        <Text className="text-craftopia-textSecondary text-xs mt-1 font-nunito">
          Loading more...
        </Text>
      </View>
    );
  }

  if (!hasNextPage && postsCount > 0) {
    return (
      <View className="py-3 items-center">
        <View className="flex-row items-center gap-1.5">
          <Sparkles size={12} color="#E3A84F" />
          <Text className="text-craftopia-textSecondary text-xs font-nunito">
            You've reached the end!
          </Text>
        </View>
      </View>
    );
  }

  return null;
};
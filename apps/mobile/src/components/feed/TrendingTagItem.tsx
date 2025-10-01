import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface TrendingTagProps {
  tag: string;
  count: number;
  growth?: number;
  onPress?: () => void;
}

export const TrendingTagItem: React.FC<TrendingTagProps> = ({ tag, count, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mr-3"
    >
      <View className="bg-craftopia-light rounded-lg px-3 py-2 items-center min-w-16">
        <Text className="text-craftopia-primary font-medium text-sm">#{tag}</Text>
        <Text className="text-craftopia-textSecondary text-xs mt-0.5">{count} posts</Text>
      </View>
    </TouchableOpacity>
  );
};
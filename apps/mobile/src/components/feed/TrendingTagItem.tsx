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
      activeOpacity={0.8}
      className="mr-3"
    >
      <View className="items-center">
        <Text className="text-craftopia-primary font-medium text-sm">#{tag}</Text>
        <Text className="text-craftopia-textSecondary text-xs">{count} posts</Text>
      </View>
    </TouchableOpacity>
  );
};
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface TrendingTagProps {
  tag: string;
  count: number;
  growth?: number;
  onPress?: () => void;
}

export const TrendingTagItem: React.FC<TrendingTagProps> = (props) => {
  const tag = props.tag || props['tag'] || 'unknown';
  const count = props.count || props['count'] || 0;
  const growth = props.growth || props['growth'];
  const onPress = props.onPress;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mr-3"
    >
      <View className="bg-craftopia-surface border border-craftopia-light rounded-xl px-3 py-2.5 min-w-[90px]">
        {/* Tag Name */}
        <View className="flex-row items-center mb-1">
          <Text className="text-lg mr-1 text-craftopia-primary">#</Text>
          <Text 
            className="text-craftopia-primary font-poppinsBold text-sm flex-1" 
            numberOfLines={1}
          >
            {tag}
          </Text>
        </View>
        
        {/* Post Count */}
        <Text className="text-craftopia-textSecondary text-xs font-nunito">
          {count} {count === 1 ? 'post' : 'posts'}
        </Text>
        
        {/* Growth Indicator */}
        {growth && growth > 0 && (
          <Text className="text-craftopia-success text-xs font-poppinsBold mt-0.5">
            ↑ {growth}%
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};
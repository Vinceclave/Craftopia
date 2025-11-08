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
      <View className="bg-white border border-craftopa-light/10 rounded-2xl px-4 py-3 min-w-[100px] shadow-sm">
        {/* Tag Name */}
        <View className="flex-row items-center mb-1">
          <Text className="text-xl mr-1">#</Text>
          <Text 
            className="text-craftopa-primary font-poppinsBold text-sm flex-1 tracking-tight" 
            numberOfLines={1}
          >
            {tag}
          </Text>
        </View>
        
        {/* Post Count */}
        <Text className="text-craftopa-textSecondary text-xs font-nunito tracking-wide">
          {count} {count === 1 ? 'post' : 'posts'}
        </Text>
        
        {/* Growth Indicator */}
        {growth && growth > 0 && (
          <Text className="text-green-600 text-xs font-poppinsBold mt-1 tracking-tight">
            ↑ {growth}%
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};
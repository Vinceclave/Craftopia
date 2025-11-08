import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface TrendingTagProps {
  tag: string;
  count: number;
  growth?: number;
  onPress?: () => void;
}

export const TrendingTagItem: React.FC<TrendingTagProps> = (props) => {
  console.log('🏷️ [TrendingTagItem] Props received:', JSON.stringify(props, null, 2));
  
  // Handle both destructured and direct access
  const tag = props.tag || props['tag'] || 'unknown';
  const count = props.count || props['count'] || 0;
  const growth = props.growth || props['growth'];
  const onPress = props.onPress;
  
  console.log('🏷️ [TrendingTagItem] Final values:', { tag, count, growth });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mr-3"
    >
      <View className="bg-white border border-blue-400 rounded-xl px-4 py-3 min-w-[100px]">
        {/* Tag Name */}
        <View className="flex-row items-center mb-1">
          <Text className="text-xl mr-1">#</Text>
          <Text 
            className="text-blue-600 font-semibold text-sm flex-1" 
            numberOfLines={1}
          >
            {tag}
          </Text>
        </View>
        
        {/* Post Count */}
        <Text className="text-gray-500 text-xs">
          {count} {count === 1 ? 'post' : 'posts'}
        </Text>
        
        {/* Growth Indicator */}
        {growth && growth > 0 && (
          <Text className="text-green-600 text-xs font-medium mt-1">
            ↑ {growth}%
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};
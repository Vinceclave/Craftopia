// apps/mobile/src/components/feed/TrendingTagItem.tsx
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface TrendingTagProps {
  tag: string;
  count: number;
  growth?: number;
  onPress?: () => void;
}

export const TrendingTagItem: React.FC<TrendingTagProps> = ({ tag, count, growth, onPress }) => {
  const hasGrowth = typeof growth === 'number' && growth > 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="mr-3 rounded-full overflow-hidden"
    >
      <LinearGradient
        colors={['#E0F2FF', '#F0FAFF']} // soft blue gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 py-2 min-w-[120px] flex-row items-center justify-between shadow-md"
      >
        <View className="flex-1 pr-2">
          <Text className="text-craftopia-primary font-bold text-sm" numberOfLines={1}>
            #{tag}
          </Text>
          <Text className="text-craftopia-secondary text-xs mt-0.5">
            {count} posts
          </Text>
        </View>

        {hasGrowth && (
          <View className="flex-row items-center ml-2 bg-white/30 rounded-full px-2 py-0.5">
            <TrendingUp size={14} color="#10B981" />
            <Text className="text-[#10B981] text-xs font-semibold ml-1">
              +{growth}%
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

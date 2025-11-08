import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { TrendingTagItem } from './TrendingTagItem';
import { useTrendingTags } from '~/hooks/queries/usePosts';

interface TrendingTagsSectionProps {
  visible: boolean;
  onTagPress: (tag: string) => void;
}

export const TrendingTagsSection: React.FC<TrendingTagsSectionProps> = ({ visible, onTagPress }) => {
  const { data: trendingTags = [], isLoading, error } = useTrendingTags();

  if (!visible) {
    return null;
  }

  if (isLoading) {
    return (
      <View className="bg-white px-5 py-4 border-b border-craftopa-light/10">
        <View className="flex-row items-center mb-3">
          <TrendingUp size={18} color="#5A7160" />
          <Text className="text-base font-poppinsBold text-craftopa-textPrimary ml-2 tracking-tight">Trending Tags</Text>
        </View>
        <View className="flex-row items-center py-3">
          <ActivityIndicator size="small" color="#5A7160" />
          <Text className="text-sm text-craftopa-textSecondary ml-2 font-nunito tracking-wide">Loading trending tags...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-white px-5 py-4 border-b border-craftopa-light/10">
        <Text className="text-sm text-red-500 font-nunito tracking-wide">Failed to load trending tags</Text>
      </View>
    );
  }

  if (!trendingTags || trendingTags.length === 0) {
    return (
      <View className="bg-white px-5 py-4 border-b border-craftopa-light/10">
        <View className="flex-row items-center mb-3">
          <TrendingUp size={18} color="#9CA3AF" />
          <Text className="text-base font-poppinsBold text-craftopa-textPrimary ml-2 tracking-tight">Trending Tags</Text>
        </View>
        <Text className="text-sm text-craftopa-textSecondary font-nunito tracking-wide">No trending tags yet</Text>
      </View>
    );
  }

  return (
    <View className="bg-white px-5 py-4 border-b border-craftopa-light/10">
      <View className="flex-row items-center mb-3">
        <TrendingUp size={18} color="#5A7160" />
        <Text className="text-base font-poppinsBold text-craftopa-textPrimary ml-2 tracking-tight">Trending Tags</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {trendingTags.map((item, index) => {
          const tagValue = item?.tag || item?.name || item?.tagName || 'unknown';
          const countValue = Number(item?.count || item?.post_count || item?.postCount || 0);
          const growthValue = item?.growth ? Number(item.growth) : undefined;
          
          return (
            <TrendingTagItem 
              key={`tag-${tagValue}-${index}`}
              tag={tagValue}
              count={countValue}
              growth={growthValue}
              onPress={() => onTagPress(tagValue)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};
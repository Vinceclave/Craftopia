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
      <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light">
        <View className="flex-row items-center mb-2">
          <TrendingUp size={16} color="#3B6E4D" />
          <Text className="text-base font-poppinsBold text-craftopia-textPrimary ml-2">Trending Tags</Text>
        </View>
        <View className="flex-row items-center py-2">
          <ActivityIndicator size="small" color="#3B6E4D" />
          <Text className="text-sm text-craftopia-textSecondary ml-2 font-nunito">Loading trending tags...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light">
        <Text className="text-sm text-craftopia-error font-nunito">Failed to load trending tags</Text>
      </View>
    );
  }

  if (!trendingTags || trendingTags.length === 0) {
    return (
      <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light">
        <View className="flex-row items-center mb-2">
          <TrendingUp size={16} color="#5F6F64" />
          <Text className="text-base font-poppinsBold text-craftopia-textPrimary ml-2">Trending Tags</Text>
        </View>
        <Text className="text-sm text-craftopia-textSecondary font-nunito">No trending tags yet</Text>
      </View>
    );
  }

  return (
    <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light">
      <View className="flex-row items-center mb-2">
        <TrendingUp size={16} color="#3B6E4D" />
        <Text className="text-base font-poppinsBold text-craftopia-textPrimary ml-2">Trending Tags</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 12 }}
      >
        {trendingTags.map((item: any, index: any) => {
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
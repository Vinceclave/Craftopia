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

  console.log('🏷️ [TrendingTagsSection] State:', {
    visible,
    isLoading,
    hasError: !!error,
    tagsCount: trendingTags?.length || 0,
  });

  console.log('🏷️ [TrendingTagsSection] Raw tags data:', JSON.stringify(trendingTags, null, 2));

  if (!visible) {
    return null;
  }

  if (isLoading) {
    return (
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center mb-3">
          <TrendingUp size={18} color="#10B981" />
          <Text className="text-base font-semibold text-gray-900 ml-2">Trending Tags</Text>
        </View>
        <View className="flex-row items-center py-3">
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text className="text-sm text-gray-500 ml-2">Loading trending tags...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    console.error('🏷️ [TrendingTagsSection] Error:', error);
    return (
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <Text className="text-sm text-red-500">Failed to load trending tags</Text>
      </View>
    );
  }

  if (!trendingTags || trendingTags.length === 0) {
    return (
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center mb-3">
          <TrendingUp size={18} color="#9CA3AF" />
          <Text className="text-base font-semibold text-gray-900 ml-2">Trending Tags</Text>
        </View>
        <Text className="text-sm text-gray-500">No trending tags yet</Text>
      </View>
    );
  }

  return (
    <View className="bg-white px-4 py-4 border-b border-gray-100">
      <View className="flex-row items-center mb-3">
        <TrendingUp size={18} color="#10B981" />
        <Text className="text-base font-semibold text-gray-900 ml-2">Trending Tags</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {trendingTags.map((item, index) => {
          console.log(`🏷️ [TrendingTagsSection] Mapping tag ${index}:`, item);
          
          // Extract values - handle different possible structures
          const tagValue = item?.tag || item?.name || item?.tagName || 'unknown';
          const countValue = Number(item?.count || item?.post_count || item?.postCount || 0);
          const growthValue = item?.growth ? Number(item.growth) : undefined;
          
          console.log(`🏷️ [TrendingTagsSection] Extracted values for ${index}:`, {
            original: item,
            tagValue,
            countValue,
            growthValue,
          });
          
          return (
            <TrendingTagItem 
              key={`tag-${tagValue}-${index}`}
              tag={tagValue}
              count={countValue}
              growth={growthValue}
              onPress={() => {
                console.log('🏷️ [TrendingTagsSection] Tag clicked:', tagValue);
                onTagPress(tagValue);
              }}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};
import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { TrendingTagItem } from './TrendingTagItem';
import { useTrendingTags } from '~/hooks/queries/usePosts';

interface TrendingTagsSectionProps {
  visible: boolean;
}

export const TrendingTagsSection: React.FC<TrendingTagsSectionProps> = ({ visible }) => {
  const { data: trendingTags = [], isLoading, error } = useTrendingTags();

  if (!visible) return null;

  if (isLoading) {
    return (
      <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light">
        <Text className="text-sm font-semibold text-craftopia-textPrimary mb-2">Trending Tags</Text>
        <View className="flex-row items-center py-2">
          <ActivityIndicator size="small" color="#004E98" />
          <Text className="text-xs text-craftopia-textSecondary ml-2">Loading tags...</Text>
        </View>
      </View>
    );
  }

  if (error || trendingTags.length === 0) {
    return null;
  }

  return (
    <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light">
      <Text className="text-sm font-semibold text-craftopia-textPrimary mb-2">Trending Tags</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {trendingTags.map((tag) => (
          <TrendingTagItem 
            key={tag.tag} 
            tag={tag.tag}
            count={tag.count}
            growth={tag.growth}
            onPress={() => {
              // Handle tag press - could filter posts by tag
              console.log('Tag pressed:', tag.tag);
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
};
// apps/mobile/src/components/feed/FeedListHeader.tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { ActiveFilters } from './ActiveFilters';
import { TrendingTagsSection } from './TrendingTagsSection';
import type { FeedType } from '~/hooks/queries/usePosts';

interface FeedListHeaderProps {
  // Active Filters Props
  searchQuery: string;
  selectedCategory: string;
  selectedTag: string | null;
  postsCount: number;
  onClearAll: () => void;
  onClearSearch: () => void;
  onClearCategory: () => void;
  onClearTag: () => void;
  categories: Array<{ id: string; label: string }>;
  
  // Trending Tags Props
  activeTab: FeedType;
  onTagPress: (tag: string) => void;
  
  // Refresh Indicator
  isRefetching: boolean;
  isLoading: boolean;
}

export const FeedListHeader: React.FC<FeedListHeaderProps> = ({
  searchQuery,
  selectedCategory,
  selectedTag,
  postsCount,
  onClearAll,
  onClearSearch,
  onClearCategory,
  onClearTag,
  categories,
  activeTab,
  onTagPress,
  isRefetching,
  isLoading,
}) => {
  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedTag;

  return (
    <>
      {/* Active Filters */}
      <ActiveFilters
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        selectedTag={selectedTag}
        postsCount={postsCount}
        onClearAll={onClearAll}
        onClearSearch={onClearSearch}
        onClearCategory={onClearCategory}
        onClearTag={onClearTag}
        categories={categories}
      />

      {/* Trending Tags Section */}
      <TrendingTagsSection
        visible={activeTab === 'trending' && !hasActiveFilters}
        onTagPress={onTagPress}
      />

      {/* Real-time indicator */}
      {isRefetching && !isLoading && (
        <View className="bg-craftopia-primary/10 px-4 py-2 flex-row items-center justify-center">
          <ActivityIndicator size="small" color="#374A36" />
          <Text className="text-craftopia-primary text-xs font-medium ml-2">
            Updating feed...
          </Text>
        </View>
      )}
    </>
  );
};
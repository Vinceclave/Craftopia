import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { ActiveFilters } from './ActiveFilters';
import { TrendingTagsSection } from './TrendingTagsSection';
import type { FeedType } from '~/hooks/queries/usePosts';

interface FeedListHeaderProps {
  searchQuery: string;
  selectedCategory: string;
  selectedTag: string | null;
  postsCount: number;
  onClearAll: () => void;
  onClearSearch: () => void;
  onClearCategory: () => void;
  onClearTag: () => void;
  categories: Array<{ id: string; label: string }>;
  activeTab: FeedType;
  onTagPress: (tag: string) => void;
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
        <View className="bg-craftopa-primary/5 px-5 py-2 flex-row items-center justify-center border-b border-craftopa-light/10">
          <ActivityIndicator size="small" color="#5A7160" />
          <Text className="text-craftopa-primary text-xs font-poppinsBold ml-1.5 tracking-tight">
            Updating feed...
          </Text>
        </View>
      )}
    </>
  );
};
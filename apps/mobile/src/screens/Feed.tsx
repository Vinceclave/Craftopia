// apps/mobile/src/screens/Feed.tsx - FIXED: Using props only, no useNavigation
import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, RefreshControl, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PostContainer } from '~/components/feed/post/PostContainer';
import { FeedHeader } from '~/components/feed/FeedHeader';
import { FeedListHeader } from '~/components/feed/FeedListHeader';
import { FeedListEmpty } from '~/components/feed/FeedListEmpty';
import { FeedListFooter } from '~/components/feed/FeedListFooter';
import { CreatePostFAB } from '~/components/feed/CreatePostFab';
import { CategoryFilterModal } from '~/components/feed/CategoryFilterModal';
import { SearchModal } from '~/components/feed/post/SearchModal';

import type { FeedStackParamList } from '~/navigations/types';

import { 
  useInfinitePosts, 
  useSearchPosts,
  useTogglePostReaction, 
  type FeedType,
  type Post
} from '~/hooks/queries/usePosts';
import { useWebSocket } from '~/context/WebSocketContext';

const CATEGORIES = [
  { id: 'all', label: 'All Categories', icon: '📋' },
  { id: 'Social', label: 'Social', icon: '👥' },
  { id: 'Tutorial', label: 'Tutorial', icon: '📚' },
  { id: 'Challenge', label: 'Challenge', icon: '🏆' },
  { id: 'Marketplace', label: 'Marketplace', icon: '🛒' },
  { id: 'Other', label: 'Other', icon: '📝' },
];

// ✅ Use screen props instead of useNavigation hook
type FeedScreenProps = NativeStackScreenProps<FeedStackParamList, 'Feed'>;

export const FeedScreen: React.FC<FeedScreenProps> = ({ navigation }) => {
  
  // State
  const [activeTab, setActiveTab] = useState<FeedType>('all');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [connectionPulse] = useState(new Animated.Value(1));
  
  const { isConnected } = useWebSocket();

  // Determine which query to use
  const isFiltering = searchQuery || selectedCategory !== 'all' || selectedTag;

  // Main posts query (used when no filters)
  const mainQuery = useInfinitePosts(activeTab);

  // Search query (used when filtering)
  const searchParams = {
    query: searchQuery || undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    tag: selectedTag || undefined,
    limit: 10,
  };
  const searchQueryResult = useSearchPosts(searchParams);

  // Use the appropriate query
  const activeQuery = isFiltering ? searchQueryResult : mainQuery;

  const { 
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = activeQuery;

  const toggleReactionMutation = useTogglePostReaction();

  // Flatten pages into single array
  const posts = data?.pages.flatMap(page => page.posts) ?? [];

  // Pulse animation for connection status
  useEffect(() => {
    if (isConnected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(connectionPulse, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(connectionPulse, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      connectionPulse.setValue(1);
    }
  }, [isConnected, connectionPulse]);

  // Handlers
  const handleToggleReaction = useCallback(async (postId: number) => {
    try {
      await toggleReactionMutation.mutateAsync(postId);
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  }, [toggleReactionMutation]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleCreatePost = useCallback(() => {
    navigation.navigate('Create', { onPostCreated: handleRefresh });
  }, [navigation, handleRefresh]);

  const handleSearchPress = useCallback(() => {
    setShowSearchModal(true);
  }, []);

  const handleSearchResult = useCallback((result: any) => {
    switch (result.type) {
      case 'post':
        setShowSearchModal(false);
        break;
      case 'tag':
        setSelectedTag(result.tag);
        setActiveTab('all');
        setShowSearchModal(false);
        break;
      case 'user':
        setShowSearchModal(false);
        break;
    }
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setActiveTab('all');
  }, []);

  const handleTagPress = useCallback((tag: string) => {
    setSelectedTag(tag);
    setActiveTab('all');
  }, []);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowCategoryFilter(false);
  }, []);

  const handleTabChange = useCallback((tab: FeedType) => {
    setActiveTab(tab);
    clearAllFilters();
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTag(null);
  }, []);

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedTag;

  // Generate unique, stable key for each post
  const getPostKey = useCallback((item: Post, index: number) => {
    const postId = item?.post_id || `temp-${index}`;
    const timestamp = item?.updated_at || item?.created_at || '';
    return `post-${postId}-${timestamp}`;
  }, []);

  const renderPost = useCallback(({ item, index }: { item: Post; index: number }) => {
    // Validate post has required data
    if (!item || !item.post_id || !item.title) {
      console.warn('Invalid post data:', item);
      return null;
    }

    return (
      <PostContainer
        key={getPostKey(item, index)}
        postId={item.post_id}
        {...item}
        onToggleReaction={() => handleToggleReaction(item.post_id)}
      />
    );
  }, [getPostKey, handleToggleReaction]);

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopa-light/5">
      {/* Header */}
      <FeedHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSearchPress={handleSearchPress}
        onFilterPress={() => setShowCategoryFilter(true)}
        hasActiveFilter={selectedCategory !== 'all'}
      />

      {/* Posts List */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={getPostKey}
        ListHeaderComponent={
          <FeedListHeader
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            selectedTag={selectedTag}
            postsCount={posts.length}
            onClearAll={clearAllFilters}
            onClearSearch={() => setSearchQuery('')}
            onClearCategory={() => setSelectedCategory('all')}
            onClearTag={() => setSelectedTag(null)}
            categories={CATEGORIES}
            activeTab={activeTab}
            onTagPress={handleTagPress}
            isRefetching={isRefetching}
            isLoading={isLoading}
          />
        }
        ListFooterComponent={
          <FeedListFooter
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage ?? false}
            postsCount={posts.length}
          />
        }
        ListEmptyComponent={
          <FeedListEmpty
            isLoading={isLoading}
            error={error as Error | null}
            hasActiveFilters={hasActiveFilters}
            onRefresh={handleRefresh}
            onClearFilters={clearAllFilters}
            onCreatePost={handleCreatePost}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching && !isLoading} 
            onRefresh={handleRefresh} 
            colors={['#5A7160']}
            tintColor="#5A7160"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingBottom: 100,
          flexGrow: 1 
        }}
      />

      {/* Create Post FAB */}
      <CreatePostFAB onPress={handleCreatePost} />

      {/* Search Modal */}
      <SearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onResultPress={handleSearchResult}
        onSearch={handleSearch}
      />

      {/* Category Filter Modal */}
      <CategoryFilterModal
        visible={showCategoryFilter}
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelect={handleCategorySelect}
        onClose={() => setShowCategoryFilter(false)}
      />
    </SafeAreaView>
  );
};
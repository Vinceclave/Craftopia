// apps/mobile/src/screens/Feed.tsx - FIXED VERSION WITH PROPER KEYS
import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Search, 
  TrendingUp, 
  Star, 
  Flame, 
  LayoutGrid, 
  Plus, 
  Wifi, 
  WifiOff,
  Filter,
  X,
} from 'lucide-react-native';
import { PostContainer } from '~/components/feed/post/PostContainer';
import { TrendingTagItem } from '~/components/feed/TrendingTagItem';
import { FeedStackParamList } from '~/navigations/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { 
  useInfinitePosts, 
  useSearchPosts,
  useTogglePostReaction, 
  useTrendingTags, 
  type FeedType,
  type Post
} from '~/hooks/queries/usePosts';
import { useWebSocket } from '~/context/WebSocketContext';
import { SearchModal } from '~/components/feed/post/SearchModal';


const FEED_TABS = [
  { key: 'all' as FeedType, label: 'All', icon: LayoutGrid },
  { key: 'trending' as FeedType, label: 'Trending', icon: TrendingUp },
  { key: 'popular' as FeedType, label: 'Popular', icon: Flame },
  { key: 'featured' as FeedType, label: 'Featured', icon: Star },
];

const CATEGORIES = [
  { id: 'all', label: 'All Categories', icon: '📋' },
  { id: 'Social', label: 'Social', icon: '👥' },
  { id: 'Tutorial', label: 'Tutorial', icon: '📚' },
  { id: 'Challenge', label: 'Challenge', icon: '🏆' },
  { id: 'Marketplace', label: 'Marketplace', icon: '🛒' },
  { id: 'Other', label: 'Other', icon: '📝' },
];

export const FeedScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<FeedStackParamList>>();
  const [activeTab, setActiveTab] = useState<FeedType>('all');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { isConnected } = useWebSocket();
  const [connectionPulse] = useState(new Animated.Value(1));

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

  const { 
    data: trendingTags = [], 
    isLoading: tagsLoading 
  } = useTrendingTags();

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
  }, [isConnected]);

  const handleToggleReaction = async (postId: number) => {
    try {
      await toggleReactionMutation.mutateAsync(postId);
    } catch (error) {
      console.error('❌ Failed to toggle reaction:', error);
    }
  };

  const handleRefresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      console.log('📄 Loading next page...');
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleCreatePost = () => {
    navigation.navigate('Create', { onPostCreated: handleRefresh });
  };

  const handleSearchPress = () => {
    setShowSearchModal(true);
  };

  const handleSearchResult = (result: any) => {
    console.log('🔍 Search result selected:', result);
    
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
  };

  const handleSearch = (query: string) => {
    console.log('🔍 Searching:', query);
    setSearchQuery(query);
    setActiveTab('all');
  };

  const handleTagPress = (tag: string) => {
    console.log('🏷️ Tag pressed:', tag);
    setSelectedTag(tag);
    setActiveTab('all');
  };

  const handleCategorySelect = (categoryId: string) => {
    console.log('📁 Category selected:', categoryId);
    setSelectedCategory(categoryId);
    setShowCategoryFilter(false);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTag(null);
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedTag;

  const renderTab = (tab: typeof FEED_TABS[0]) => {
    const isActive = activeTab === tab.key;
    const IconComponent = tab.icon;
    return (
      <TouchableOpacity
        key={tab.key}
        onPress={() => {
          console.log('📑 Switching to tab:', tab.key);
          setActiveTab(tab.key);
          clearAllFilters();
        }}
        className={`mr-4 pb-2 ${isActive ? 'border-b-2 border-craftopia-primary' : ''}`}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          <IconComponent 
            size={16} 
            color={isActive ? '#374A36' : '#5D6B5D'} 
          />
          <Text className={`text-sm font-medium ml-1.5 ${
            isActive ? 'text-craftopia-primary' : 'text-craftopia-textSecondary'
          }`}>
            {tab.label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderConnectionStatus = () => {
    return (
      <View className="flex-row items-center">
        <Animated.View style={{ transform: [{ scale: connectionPulse }] }}>
          {isConnected ? (
            <Wifi size={14} color="#10B981" />
          ) : (
            <WifiOff size={14} color="#EF4444" />
          )}
        </Animated.View>
        <Text className={`text-xs ml-1 ${
          isConnected ? 'text-green-600' : 'text-red-600'
        }`}>
          {isConnected ? 'Live' : 'Offline'}
        </Text>
      </View>
    );
  };

  // FIXED: Generate unique, stable key for each post
  const getPostKey = (item: Post, index: number) => {
    // Use post_id as primary key, fallback to index if somehow missing
    const postId = item?.post_id || `temp-${index}`;
    const timestamp = item?.updated_at || item?.created_at || '';
    return `post-${postId}-${timestamp}`;
  };

  const renderPost = useCallback(({ item, index }: { item: Post; index: number }) => {
    // Validate post has required data
    if (!item || !item.post_id || !item.title) {
      console.warn('⚠️ Invalid post data:', item);
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
  }, []);

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color="#374A36" />
          <Text className="text-craftopia-textSecondary text-xs mt-2">
            Loading more posts...
          </Text>
        </View>
      );
    }

    if (!hasNextPage && posts.length > 0) {
      return (
        <View className="py-6 items-center">
          <Text className="text-craftopia-textSecondary text-xs">
            🎉 You've reached the end!
          </Text>
        </View>
      );
    }

    return null;
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center py-12">
          <ActivityIndicator size="large" color="#374A36" />
          <Text className="text-craftopia-textSecondary text-sm mt-3">
            Loading posts...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 justify-center items-center py-12 px-6">
          <Text className="text-craftopia-textPrimary text-lg font-semibold text-center mb-2">
            Oops! Something went wrong
          </Text>
          <Text className="text-craftopia-textSecondary text-sm text-center mb-4">
            {(error as Error).message}
          </Text>
          <TouchableOpacity 
            onPress={handleRefresh} 
            className="bg-craftopia-primary px-6 py-3 rounded-lg"
            activeOpacity={0.7}
          >
            <Text className="text-white text-sm font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="flex-1 justify-center items-center py-12 px-6">
        <Text className="text-2xl mb-2">📝</Text>
        <Text className="text-craftopia-textPrimary text-lg font-semibold mb-2">
          No posts found
        </Text>
        <Text className="text-craftopia-textSecondary text-center text-sm mb-4">
          {hasActiveFilters 
            ? 'Try adjusting your filters or search terms'
            : 'Be the first to share something!'
          }
        </Text>
        <TouchableOpacity 
          onPress={hasActiveFilters ? clearAllFilters : handleCreatePost} 
          className="bg-craftopia-primary px-6 py-3 rounded-lg flex-row items-center"
          activeOpacity={0.7}
        >
          {hasActiveFilters ? (
            <Text className="text-white text-sm font-medium">Clear Filters</Text>
          ) : (
            <>
              <Plus size={18} color="white" />
              <Text className="text-white text-sm font-medium ml-2">Create Post</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const ListHeaderComponent = () => (
    <>
      {/* Active Filters */}
      {hasActiveFilters && (
        <View className="bg-craftopia-primary/10 px-4 py-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-craftopia-primary font-medium text-sm">
              Active Filters ({posts.length} results)
            </Text>
            <TouchableOpacity 
              onPress={clearAllFilters}
              className="flex-row items-center"
            >
              <X size={14} color="#374A36" />
              <Text className="text-craftopia-primary text-xs font-medium ml-1">
                Clear All
              </Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-row flex-wrap gap-2">
            {searchQuery && (
              <View className="bg-craftopia-primary rounded-full px-3 py-1 flex-row items-center">
                <Search size={12} color="white" />
                <Text className="text-white text-xs font-medium ml-1">
                  "{searchQuery}"
                </Text>
                <TouchableOpacity 
                  onPress={() => setSearchQuery('')}
                  className="ml-1"
                >
                  <X size={12} color="white" />
                </TouchableOpacity>
              </View>
            )}
            
            {selectedCategory !== 'all' && (
              <View className="bg-craftopia-primary rounded-full px-3 py-1 flex-row items-center">
                <Text className="text-white text-xs font-medium">
                  {CATEGORIES.find(c => c.id === selectedCategory)?.label}
                </Text>
                <TouchableOpacity 
                  onPress={() => setSelectedCategory('all')}
                  className="ml-1"
                >
                  <X size={12} color="white" />
                </TouchableOpacity>
              </View>
            )}
            
            {selectedTag && (
              <View className="bg-craftopia-primary rounded-full px-3 py-1 flex-row items-center">
                <Text className="text-white text-xs font-medium">
                  #{selectedTag}
                </Text>
                <TouchableOpacity 
                  onPress={() => setSelectedTag(null)}
                  className="ml-1"
                >
                  <X size={12} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Trending Tags Section */}
      {activeTab === 'trending' && !hasActiveFilters && (
        <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light/30">
          <Text className="text-sm font-semibold text-craftopia-textPrimary mb-2">
            🔥 Trending Tags
          </Text>
          {tagsLoading ? (
            <View className="flex-row items-center py-2">
              <ActivityIndicator size="small" color="#374A36" />
              <Text className="text-xs text-craftopia-textSecondary ml-2">
                Loading tags...
              </Text>
            </View>
          ) : trendingTags.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 16 }}
            >
              {trendingTags.map(tag => (
                <TrendingTagItem
                  key={tag.tag}
                  tag={tag.tag}
                  count={tag.count}
                  onPress={() => handleTagPress(tag.tag)}
                />
              ))}
            </ScrollView>
          ) : null}
        </View>
      )}

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

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-light">
      {/* Header */}
      <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light/30">
        <View className="flex-row justify-between items-center mb-3">
          <View>
            <View className="flex-row items-center">
              <Text className="text-base font-semibold text-craftopia-textPrimary">
                Feed
              </Text>
              <View className="ml-2">{renderConnectionStatus()}</View>
            </View>
            <Text className="text-xs text-craftopia-textSecondary">
              {isConnected 
                ? '✨ Real-time updates enabled' 
                : '⚠️ Reconnecting...'
              }
            </Text>
          </View>
          
          <View className="flex-row items-center gap-2">
            {/* Category Filter Button */}
            <TouchableOpacity 
              className="w-9 h-9 bg-craftopia-light rounded-full items-center justify-center relative" 
              activeOpacity={0.7}
              onPress={() => setShowCategoryFilter(true)}
            >
              <Filter size={18} color="#5D6B5D" />
              {selectedCategory !== 'all' && (
                <View className="absolute top-0 right-0 w-2 h-2 bg-craftopia-primary rounded-full" />
              )}
            </TouchableOpacity>
            
            {/* Search Button */}
            <TouchableOpacity 
              className="w-9 h-9 bg-craftopia-light rounded-full items-center justify-center" 
              activeOpacity={0.7}
              onPress={handleSearchPress}
            >
              <Search size={18} color="#5D6B5D" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Tabs */}
        <View className="flex-row">
          {FEED_TABS.map(renderTab)}
        </View>
      </View>

      {/* Posts List */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={getPostKey}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching && !isLoading} 
            onRefresh={handleRefresh} 
            colors={['#374A36']}
            tintColor="#374A36"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingBottom: 100,
          flexGrow: 1 
        }}
      />

      {/* Create Post FAB */}
      <TouchableOpacity
        onPress={handleCreatePost}
        className="absolute bottom-24 right-5 w-14 h-14 bg-craftopia-primary rounded-full items-center justify-center"
        activeOpacity={0.8}
        style={{
          shadowColor: '#374A36',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>

      {/* Search Modal */}
      <SearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onResultPress={handleSearchResult}
        onSearch={handleSearch}
      />

      {/* Category Filter Modal */}
      {showCategoryFilter && (
        <View className="absolute inset-0 bg-black/50 justify-end">
          <View className="bg-craftopia-surface rounded-t-xl p-4">
            <View className="w-8 h-0.5 bg-craftopia-light rounded-full self-center mb-4" />
            <Text className="text-base font-semibold text-craftopia-textPrimary mb-4 text-center">
              Filter by Category
            </Text>
            
            <ScrollView className="max-h-96">
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  className={`flex-row items-center p-3 rounded-lg mb-2 ${
                    selectedCategory === category.id 
                      ? 'bg-craftopia-primary/10 border border-craftopia-primary/20' 
                      : 'bg-craftopia-light'
                  }`}
                  onPress={() => handleCategorySelect(category.id)}
                >
                  <Text className="text-xl mr-3">{category.icon}</Text>
                  <Text className={`font-medium ${
                    selectedCategory === category.id 
                      ? 'text-craftopia-primary' 
                      : 'text-craftopia-textPrimary'
                  }`}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              className="mt-4 p-3 bg-craftopia-light rounded-lg"
              onPress={() => setShowCategoryFilter(false)}
            >
              <Text className="text-center font-medium text-craftopia-textSecondary">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};
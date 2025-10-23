// apps/mobile/src/screens/Feed.tsx - FINAL COMPLETE VERSION
import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Alert,
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
} from 'lucide-react-native';
import { PostContainer } from '~/components/feed/post/PostContainer';
import { TrendingTagItem } from '~/components/feed/TrendingTagItem';
import { FeedStackParamList } from '~/navigations/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Import TanStack Query hooks
import { 
  useInfinitePosts, 
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

export const FeedScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<FeedStackParamList>>();
  const [activeTab, setActiveTab] = useState<FeedType>('all');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { isConnected } = useWebSocket();
  const [connectionPulse] = useState(new Animated.Value(1));

  // Infinite query for posts
  const { 
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    dataUpdatedAt
  } = useInfinitePosts(activeTab);

  const { 
    data: trendingTags = [], 
    isLoading: tagsLoading 
  } = useTrendingTags();

  const toggleReactionMutation = useTogglePostReaction();

  // Flatten pages into single array
  const posts = data?.pages.flatMap(page => page.posts) ?? [];

  // Filter by selected tag if any
  const filteredPosts = selectedTag 
    ? posts.filter(post => post.tags?.includes(selectedTag))
    : posts;

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
        // Post will open in details modal when clicked
        Alert.alert('Search Result', `Opening post: ${result.title}`);
        break;
      case 'tag':
        setSelectedTag(result.tag);
        setActiveTab('all');
        setShowSearchModal(false);
        break;
      case 'user':
        Alert.alert('User Profile', `User: ${result.username}\n\n(User profiles feature coming soon!)`);
        break;
    }
  };

  const handleTagPress = (tag: string) => {
    console.log('🏷️ Tag pressed:', tag);
    setSelectedTag(tag);
    setActiveTab('all');
  };

  const renderTab = (tab: typeof FEED_TABS[0]) => {
    const isActive = activeTab === tab.key;
    const IconComponent = tab.icon;
    return (
      <TouchableOpacity
        key={tab.key}
        onPress={() => {
          console.log('📑 Switching to tab:', tab.key);
          setActiveTab(tab.key);
          setSelectedTag(null);
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

  const renderPost = useCallback(({ item }: { item: Post }) => (
    <PostContainer
      key={`${item.post_id}-${item.updated_at}`}
      postId={item.post_id}
      {...item}
      onToggleReaction={() => handleToggleReaction(item.post_id)}
    />
  ), []);

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

    if (!hasNextPage && filteredPosts.length > 0) {
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
          No posts yet
        </Text>
        <Text className="text-craftopia-textSecondary text-center text-sm mb-4">
          {selectedTag 
            ? `No posts found with #${selectedTag}`
            : activeTab === 'all' 
              ? 'Be the first to share something!' 
              : `No ${activeTab} posts available`
          }
        </Text>
        <TouchableOpacity 
          onPress={selectedTag ? () => setSelectedTag(null) : handleCreatePost} 
          className="bg-craftopia-primary px-6 py-3 rounded-lg flex-row items-center"
          activeOpacity={0.7}
        >
          {selectedTag ? (
            <Text className="text-white text-sm font-medium">Clear Filter</Text>
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
      {/* Trending Tags Section */}
      {activeTab === 'trending' && !selectedTag && (
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
          ) : (
            <Text className="text-xs text-craftopia-textSecondary">
              No trending tags available
            </Text>
          )}
        </View>
      )}

      {/* Selected Tag Filter */}
      {selectedTag && (
        <View className="bg-craftopia-primary/10 px-4 py-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text className="text-craftopia-primary font-medium">
              Showing: #{selectedTag} ({filteredPosts.length})
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => setSelectedTag(null)}
            className="bg-craftopia-primary px-3 py-1 rounded-full"
          >
            <Text className="text-white text-xs font-medium">Clear</Text>
          </TouchableOpacity>
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
                : '⚠️ Reconnecting to server...'
              }
            </Text>
          </View>
          <TouchableOpacity 
            className="w-9 h-9 bg-craftopia-light rounded-full items-center justify-center" 
            activeOpacity={0.7}
            onPress={handleSearchPress}
          >
            <Search size={18} color="#5D6B5D" />
          </TouchableOpacity>
        </View>
        
        {/* Tabs */}
        <View className="flex-row">
          {FEED_TABS.map(renderTab)}
        </View>
      </View>

      {/* Posts List */}
      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => `${item.post_id}-${item.updated_at}`}
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
            title={isConnected ? "Pull to refresh" : "Reconnecting..."}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingBottom: 100,
          flexGrow: 1 
        }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={5}
        windowSize={10}
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
      />
    </SafeAreaView>
  );
};
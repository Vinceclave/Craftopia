// apps/mobile/src/screens/Feed.tsx - ENHANCED WITH PROPER WEBSOCKET INTEGRATION
import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, TrendingUp, Star, Flame, LayoutGrid, Plus, Wifi, WifiOff, RefreshCw } from 'lucide-react-native';
import { PostContainer } from '~/components/feed/post/PostContainer';
import { TrendingTagItem } from '~/components/feed/TrendingTagItem';
import { FeedStackParamList } from '~/navigations/types';
import { useNavigation } from '@react-navigation/native';

// Import TanStack Query hooks
import { usePosts, useTogglePostReaction, useTrendingTags, type FeedType } from '~/hooks/queries/usePosts';
import { useWebSocket } from '~/context/WebSocketContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const FEED_TABS = [
  { key: 'all' as FeedType, label: 'All', icon: LayoutGrid },
  { key: 'trending' as FeedType, label: 'Trending', icon: TrendingUp },
  { key: 'popular' as FeedType, label: 'Popular', icon: Flame },
  { key: 'featured' as FeedType, label: 'Featured', icon: Star },
];

export const FeedScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<FeedStackParamList>>();
  const [activeTab, setActiveTab] = useState<FeedType>('all');
  const { isConnected } = useWebSocket();
  const [connectionPulse] = useState(new Animated.Value(1));

  // TanStack Query hooks
  const { 
    data: posts = [], 
    isLoading, 
    error, 
    refetch,
    isRefetching,
    dataUpdatedAt
  } = usePosts(activeTab);

  const { 
    data: trendingTags = [], 
    isLoading: tagsLoading 
  } = useTrendingTags();

  const toggleReactionMutation = useTogglePostReaction();

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

  // Log data updates for debugging
  useEffect(() => {
    console.log('📊 Feed data updated:', {
      count: posts.length,
      activeTab,
      isLoading,
      isConnected,
      dataUpdatedAt: new Date(dataUpdatedAt).toISOString(),
      posts: posts.slice(0, 3).map(p => ({ 
        id: p.post_id, 
        title: p.title, 
        likes: p.likeCount,
        isLiked: p.isLiked
      }))
    });
  }, [posts, activeTab, isLoading, isConnected, dataUpdatedAt]);

  const handleToggleReaction = async (postId: number) => {
    try {
      console.log('🔵 User toggling reaction for post:', postId);
      await toggleReactionMutation.mutateAsync(postId);
    } catch (error) {
      console.error('❌ Failed to toggle reaction:', error);
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    refetch();
  };

  const handleCreatePost = () => {
    navigation.navigate('Create', { onPostCreated: handleRefresh });
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center py-6">
          <ActivityIndicator size="small" color="#374A36" />
          <Text className="text-craftopia-textSecondary text-sm mt-2">Loading posts...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 justify-center items-center py-6 px-4">
          <Text className="text-craftopia-textPrimary text-base font-semibold text-center mb-1">
            Something went wrong
          </Text>
          <Text className="text-craftopia-textSecondary text-sm text-center mb-4">
            {(error as Error).message}
          </Text>
          <TouchableOpacity 
            onPress={handleRefresh} 
            className="bg-craftopia-primary px-4 py-2 rounded-lg flex-row items-center" 
            activeOpacity={0.7}
          >
            <RefreshCw size={16} color="white" />
            <Text className="text-craftopia-surface text-sm font-medium ml-2">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (posts.length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-6">
          <Text className="text-craftopia-textPrimary text-base font-semibold mb-1">No posts yet</Text>
          <Text className="text-craftopia-textSecondary text-center text-sm mb-3">
            {activeTab === 'all' 
              ? 'Be the first to share something!' 
              : `No ${activeTab} posts available`
            }
          </Text>
          <TouchableOpacity 
            onPress={handleCreatePost} 
            className="bg-craftopia-primary px-4 py-2 rounded-lg flex-row items-center" 
            activeOpacity={0.7}
          >
            <Plus size={16} color="white" />
            <Text className="text-craftopia-surface text-sm font-medium ml-2">Create Post</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="pb-16">
        {posts.map((post, index) => {
          console.log(`🔍 Rendering post ${index + 1}/${posts.length}:`, {
            id: post.post_id,
            title: post.title,
            likes: post.likeCount,
            isLiked: post.isLiked,
            username: post.user?.username
          });
          
          return (
            <PostContainer
              key={`${post.post_id}-${post.updated_at}`} // Include timestamp to force re-render on updates
              postId={post.post_id}
              {...post}
              onToggleReaction={() => handleToggleReaction(post.post_id)}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-light">
      {/* Header */}
      <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light/30">
        <View className="flex-row justify-between items-center mb-3">
          <View>
            <View className="flex-row items-center">
              <Text className="text-base font-semibold text-craftopia-textPrimary">Feed</Text>
              {/* Connection Status Indicator */}
              <View className="ml-2">
                {renderConnectionStatus()}
              </View>
            </View>
            <Text className="text-xs text-craftopia-textSecondary">
              {isConnected 
                ? '✨ Real-time updates enabled' 
                : '⚠️ Reconnecting to server...'
              }
            </Text>
          </View>
          <TouchableOpacity 
            className="w-8 h-8 bg-craftopia-light rounded-full items-center justify-center" 
            activeOpacity={0.7}
          >
            <Search size={18} color="#5D6B5D" />
          </TouchableOpacity>
        </View>
        
        {/* Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {FEED_TABS.map(renderTab)}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={handleRefresh} 
            colors={['#374A36']}
            tintColor="#374A36"
            title={isConnected ? "Pull to refresh" : "Reconnecting..."}
          />
        }
      >
        {/* Trending Tags */}
        {activeTab === 'trending' && (
          <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light/30">
            <Text className="text-sm font-semibold text-craftopia-textPrimary mb-2">
              🔥 Trending Tags
            </Text>
            {tagsLoading ? (
              <View className="flex-row items-center py-2">
                <ActivityIndicator size="small" color="#374A36" />
                <Text className="text-xs text-craftopia-textSecondary ml-2">Loading tags...</Text>
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
                    onPress={() => console.log('Tag pressed:', tag.tag)}
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

        {/* Real-time indicator */}
        {isRefetching && (
          <View className="bg-craftopia-primary/10 px-4 py-2 flex-row items-center justify-center">
            <ActivityIndicator size="small" color="#374A36" />
            <Text className="text-craftopia-primary text-xs font-medium ml-2">
              Updating feed...
            </Text>
          </View>
        )}

        {renderContent()}
      </ScrollView>

      {/* Create Post FAB */}
      <TouchableOpacity
        onPress={handleCreatePost}
        className="absolute bottom-24 right-4 w-12 h-12 bg-craftopia-primary rounded-full items-center justify-center shadow-lg"
        activeOpacity={0.8}
        style={{
          shadowColor: '#374A36',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Plus size={20} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};
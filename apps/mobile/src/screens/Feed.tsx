// screens/Feed.tsx - Updated with TanStack Query
import React, { useState } from 'react';
import {
  Text,
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, TrendingUp, Star, Flame, LayoutGrid, Plus } from 'lucide-react-native';
import { PostContainer } from '~/components/feed/post/PostContainer';
import { TrendingTagItem } from '~/components/feed/TrendingTagItem';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FeedStackParamList } from '~/navigations/types';
import { useNavigation } from '@react-navigation/native';

// Import TanStack Query hooks
import { usePosts, useTogglePostReaction, useTrendingTags, type FeedType } from '~/hooks/queries/usePosts';

const FEED_TABS = [
  { key: 'all' as FeedType, label: 'All', icon: LayoutGrid },
  { key: 'trending' as FeedType, label: 'Trending', icon: TrendingUp },
  { key: 'popular' as FeedType, label: 'Popular', icon: Flame },
  { key: 'featured' as FeedType, label: 'Featured', icon: Star },
];

export const FeedScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<FeedStackParamList>>();
  const [activeTab, setActiveTab] = useState<FeedType>('all');

  // TanStack Query hooks
  const { 
    data: posts = [], 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = usePosts(activeTab);

  const { 
    data: trendingTags = [], 
    isLoading: tagsLoading 
  } = useTrendingTags();

  const toggleReactionMutation = useTogglePostReaction();

  const handleToggleReaction = async (postId: number) => {
    try {
      await toggleReactionMutation.mutateAsync(postId);
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  };

  const handleRefresh = () => {
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
        onPress={() => setActiveTab(tab.key)}
        className={`mr-4 pb-2 ${isActive ? 'border-b-2 border-craftopia-primary' : ''}`}
      >
        <View className="flex-row items-center">
          <IconComponent size={16} className={isActive ? 'text-craftopia-primary' : 'text-craftopia-textSecondary'} />
          <Text className={`text-sm font-medium ml-1.5 ${isActive ? 'text-craftopia-primary' : 'text-craftopia-textSecondary'}`}>
            {tab.label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center py-6">
          <ActivityIndicator size="small" color="#004E98" />
          <Text className="text-craftopia-textSecondary text-sm mt-2">Loading posts...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 justify-center items-center py-6 px-4">
          <Text className="text-craftopia-textPrimary text-base font-semibold text-center mb-1">Something went wrong</Text>
          <Text className="text-craftopia-textSecondary text-sm text-center mb-4">{error.message}</Text>
          <TouchableOpacity onPress={handleRefresh} className="bg-craftopia-primary px-4 py-2 rounded-lg">
            <Text className="text-craftopia-surface text-sm font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (posts.length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-6">
          <Text className="text-craftopia-textSecondary text-center text-base mb-3">No posts yet</Text>
          <TouchableOpacity onPress={handleRefresh} className="bg-craftopia-primary px-4 py-2 rounded-lg">
            <Text className="text-craftopia-surface text-sm font-medium">Refresh</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="pb-16">
        {posts.map(post => (
          <PostContainer
            key={post.post_id}
            postId={post.post_id}
            {...post}
            onToggleReaction={() => handleToggleReaction(post.post_id)}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-light">
      {/* Header */}
      <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light">
        <View className="flex-row justify-between items-center mb-3">
          <View>
            <Text className="text-base font-semibold text-craftopia-textPrimary">Feed</Text>
            <Text className="text-sm text-craftopia-textSecondary">Discover amazing projects</Text>
          </View>
          <TouchableOpacity className="w-8 h-8 bg-craftopia-light rounded-full items-center justify-center">
            <Search size={18} className="text-craftopia-textSecondary" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
            colors={['#004E98']} 
          />
        }
      >
        {/* Trending Tags */}
        {activeTab === 'trending' && (
          <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light">
            <Text className="text-sm font-semibold text-craftopia-textPrimary mb-2">Trending Tags</Text>
            {tagsLoading ? (
              <View className="flex-row items-center py-2">
                <ActivityIndicator size="small" color="#004E98" />
                <Text className="text-xs text-craftopia-textSecondary ml-2">Loading tags...</Text>
              </View>
            ) : trendingTags.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
              <Text className="text-xs text-craftopia-textSecondary">No trending tags available</Text>
            )}
          </View>
        )}

        {renderContent()}
      </ScrollView>

      {/* Create Post FAB */}
      <TouchableOpacity
        onPress={handleCreatePost}
        className="absolute bottom-24 right-4 w-12 h-12 bg-craftopia-primary rounded-full items-center justify-center shadow-lg"
        style={{
          shadowColor: '#004E98',
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
import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import type { PostProps } from '~/components/feed/post/type';
import { postService } from '~/services/post.service';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FeedStackParamList } from '~/navigations/types';
import { useNavigation } from '@react-navigation/native';

type FeedType = 'all' | 'trending' | 'popular' | 'featured';

interface Comment {
  comment_id: number;
  user_id: number;
  content: string;
  likeCount: number;
  isLiked: boolean;
  created_at: string;
  user: { user_id: number; username: string };
}

const FEED_TABS = [
  { key: 'all' as FeedType, label: 'All', icon: LayoutGrid },
  { key: 'trending' as FeedType, label: 'Trending', icon: TrendingUp },
  { key: 'popular' as FeedType, label: 'Popular', icon: Flame },
  { key: 'featured' as FeedType, label: 'Featured', icon: Star },
];

export const FeedScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<FeedStackParamList>>();
  const [activeTab, setActiveTab] = useState<FeedType>('all');
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [trendingTags, setTrendingTags] = useState<{ tag: string; count: number; growth?: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const pendingReactions = useRef<Set<number>>(new Set());

  const fetchPosts = useCallback(
    async (pageNumber = 1, isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else if (pageNumber === 1) setLoading(true);
        else setLoadingMore(true);

        setError(null);
        const response = await postService.getPosts(activeTab, pageNumber);
        const fetchedPosts: PostProps[] = response?.data || [];

        if (isRefresh || pageNumber === 1) {
          setPosts(fetchedPosts);
          setPage(1);
        } else {
          setPosts(prevPosts => {
            const existingIds = new Set(prevPosts.map(p => p.post_id));
            const newPosts = fetchedPosts.filter(p => !existingIds.has(p.post_id));
            return [...prevPosts, ...newPosts];
          });
          setPage(pageNumber);
        }

        setHasMore(response?.meta ? response.meta.page < response.meta.lastPage : fetchedPosts.length === 10);
      } catch (err: any) {
        setError(err.message || 'Failed to load posts');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [activeTab]
  );

  const fetchTrendingTags = useCallback(async () => {
    try {
      const response = await postService.getTrendingTags();
      setTrendingTags(response?.data || []);
    } catch (err) {
      console.error('Error fetching trending tags:', err);
    }
  }, []);

  const handleToggleReaction = useCallback(async (postId: number) => {
    if (pendingReactions.current.has(postId)) return;
    pendingReactions.current.add(postId);

    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.post_id === postId
          ? { ...post, isLiked: !post.isLiked, likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1 }
          : post
      )
    );

    try {
      await postService.toggleReaction(postId.toString());
    } catch (err) {
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.post_id === postId
            ? { ...post, isLiked: !post.isLiked, likeCount: post.isLiked ? post.likeCount + 1 : post.likeCount - 1 }
            : post
        )
      );
    } finally {
      pendingReactions.current.delete(postId);
    }
  }, []);

  const handleLoadComments = useCallback(async (postId: number): Promise<Comment[]> => {
    const mockComments: Comment[] = [
      {
        comment_id: 1,
        user_id: 2,
        content: 'Great post! Thanks for sharing.',
        likeCount: 5,
        isLiked: false,
        created_at: new Date().toISOString(),
        user: { user_id: 2, username: 'johndoe' },
      },
    ];
    await new Promise(r => setTimeout(r, 300));
    return mockComments;
  }, []);

  const handleAddComment = useCallback(async (postId: number, content: string) => {
    await new Promise(r => setTimeout(r, 300));
    setPosts(prev =>
      prev.map(post => (post.post_id === postId ? { ...post, commentCount: post.commentCount + 1 } : post))
    );
  }, []);

  const handleToggleCommentReaction = useCallback(async (commentId: number) => {
    await new Promise(r => setTimeout(r, 200));
  }, []);

  const handleRefresh = useCallback(() => {
    fetchPosts(1, true);
    if (activeTab === 'trending') fetchTrendingTags();
  }, [fetchPosts, fetchTrendingTags, activeTab]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) fetchPosts(page + 1);
  }, [loadingMore, hasMore, loading, page, fetchPosts]);

  const handleScroll = useCallback(
    (event: any) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 100) handleLoadMore();
    },
    [handleLoadMore]
  );

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts(1);
    if (activeTab === 'trending') fetchTrendingTags();
  }, [activeTab, fetchPosts, fetchTrendingTags]);

  const renderTab = useCallback(
    (tab: typeof FEED_TABS[0]) => {
      const isActive = activeTab === tab.key;
      const IconComponent = tab.icon;
      return (
        <TouchableOpacity
          key={tab.key}
          onPress={() => setActiveTab(tab.key)}
          className={`mr-4 pb-2 ${isActive ? 'border-b-2 border-craftopia-primary' : ''}`}
        >
          <View className="flex-row items-center">
            <IconComponent size={16} color={isActive ? '#004E98' : '#6B7280'} />
            <Text className={`text-sm font-medium ml-1.5 ${isActive ? 'text-craftopia-primary' : 'text-craftopia-textSecondary'}`}>
              {tab.label}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [activeTab]
  );

  const renderContent = () => {
    if (loading)
      return (
        <View className="flex-1 justify-center items-center py-6">
          <ActivityIndicator size="small" color="#004E98" />
          <Text className="text-craftopia-textSecondary text-sm mt-2">Loading posts...</Text>
        </View>
      );

    if (error)
      return (
        <View className="flex-1 justify-center items-center py-6 px-4">
          <Text className="text-craftopia-textPrimary text-base font-semibold text-center mb-1">Something went wrong</Text>
          <Text className="text-craftopia-textSecondary text-sm text-center mb-4">{error}</Text>
          <TouchableOpacity onPress={() => fetchPosts()} className="bg-craftopia-primary px-4 py-2 rounded-lg">
            <Text className="text-craftopia-surface text-sm font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      );

    if (posts.length === 0)
      return (
        <View className="flex-1 justify-center items-center py-6">
          <Text className="text-craftopia-textSecondary text-center text-base mb-3">No posts yet</Text>
          <TouchableOpacity onPress={handleRefresh} className="bg-craftopia-primary px-4 py-2 rounded-lg">
            <Text className="text-craftopia-surface text-sm font-medium">Refresh</Text>
          </TouchableOpacity>
        </View>
      );

    return (
      <View className="pb-16">
        {posts.map(post => (
          <PostContainer
            key={post.post_id}
            postId={post.post_id}
            {...post}
            onToggleReaction={() => handleToggleReaction(post.post_id)}
            onLoadComments={handleLoadComments}
            onAddComment={handleAddComment}
            onToggleCommentReaction={handleToggleCommentReaction}
          />
        ))}

        {loadingMore && (
          <View className="py-3 items-center">
            <ActivityIndicator size="small" color="#004E98" />
            <Text className="text-craftopia-textSecondary mt-1 text-xs">Loading more...</Text>
          </View>
        )}

        {!hasMore && posts.length > 0 && (
          <View className="py-4 items-center">
            <Text className="text-craftopia-textSecondary text-xs">You've reached the end!</Text>
          </View>
        )}
      </View>
    );
  };

  const handleCreate = () => {
    navigation.navigate('Create', { onPostCreated: handleRefresh });
  };

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-light">
      {/* Header */}
      <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light">
        <View className="flex-row justify-between items-center mb-3">
          <View>
            <Text className="text-base font-semibold text-craftopia-textPrimary">Feed</Text>
            <Text className="text-xs text-craftopia-textSecondary">Discover amazing projects</Text>
          </View>
          <TouchableOpacity className="w-8 h-8 bg-craftopia-light rounded-full items-center justify-center">
            <Search size={18} color="#6B7280" />
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
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#004E98']} />}
      >
        {/* Trending Tags */}
        {activeTab === 'trending' && trendingTags.length > 0 && (
          <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light">
            <Text className="text-sm font-semibold text-craftopia-textPrimary mb-2">Trending Tags</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {trendingTags.map(tag => <TrendingTagItem key={tag.tag} {...tag} />)}
            </ScrollView>
          </View>
        )}

        {renderContent()}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={handleCreate}
        className="absolute bottom-24 right-4 w-12 h-12 bg-craftopia-primary rounded-full items-center justify-center shadow-sm"
      >
        <Plus size={20} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};
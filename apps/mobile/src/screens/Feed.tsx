// apps/mobile/src/screens/feed/Feed.tsx
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
          setPosts(prevPosts => {
            const existingMap = new Map(prevPosts.map(p => [p.post_id, p]));
            return fetchedPosts.map(post => {
              const existing = existingMap.get(post.post_id);
              return existing
                ? { ...post, isLiked: existing.isLiked, likeCount: existing.likeCount }
                : post;
            });
          });
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
        console.error('Error fetching posts:', err);
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

    let originalPost: PostProps | undefined;
    setPosts(prevPosts => {
      originalPost = prevPosts.find(p => p.post_id === postId);
      return prevPosts.map(post =>
        post.post_id === postId
          ? { ...post, isLiked: !post.isLiked, likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1 }
          : post
      );
    });

    try {
      const response = await postService.toggleReaction(postId.toString());
      const data = response?.data || response;
      if (typeof data?.isLiked === 'boolean' && typeof data?.likeCount === 'number') {
        setPosts(current =>
          current.map(p => (p.post_id === postId ? { ...p, isLiked: data.isLiked, likeCount: data.likeCount } : p))
        );
      } else {
        const countResponse = await postService.getReactionCount(postId.toString());
        const serverCount = countResponse?.data?.total || 0;
        setPosts(current =>
          current.map(p =>
            p.post_id === postId ? { ...p, isLiked: !originalPost?.isLiked, likeCount: serverCount } : p
          )
        );
      }
    } catch (err) {
      console.error('Failed to toggle reaction:', err);
      if (originalPost) {
        setPosts(current =>
          current.map(p =>
            p.post_id === postId ? { ...p, isLiked: originalPost!.isLiked, likeCount: originalPost!.likeCount } : p
          )
        );
      }
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
      {
        comment_id: 2,
        user_id: 3,
        content: 'Totally agree!',
        likeCount: 2,
        isLiked: true,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        user: { user_id: 3, username: 'janesmith' },
      },
    ];
    await new Promise(r => setTimeout(r, 500));
    return mockComments;
  }, []);

  const handleAddComment = useCallback(async (postId: number, content: string) => {
    await new Promise(r => setTimeout(r, 500));
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

    const loadTabData = async () => {
      await fetchPosts(1);
      if (activeTab === 'trending') await fetchTrendingTags();
    };
    loadTabData();
  }, [activeTab, fetchPosts, fetchTrendingTags]);

  const renderTab = useCallback(
    (tab: typeof FEED_TABS[0]) => {
      const isActive = activeTab === tab.key;
      const IconComponent = tab.icon;
      return (
        <TouchableOpacity
          key={tab.key}
          onPress={() => setActiveTab(tab.key)}
          className={`mr-6 pb-3 ${isActive ? 'border-b-2 border-craftopia-primary' : ''}`}
        >
          <View className="flex-row items-center">
            <IconComponent size={18} color={isActive ? '#004E98' : '#6B7280'} />
            <Text className={`text-base font-semibold ml-2 ${isActive ? 'text-craftopia-primary' : 'text-craftopia-textSecondary'}`}>
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
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#004E98" />
          <Text className="text-gray-500 mt-4">Loading posts...</Text>
        </View>
      );

    if (error)
      return (
        <View className="flex-1 justify-center items-center py-20 px-6">
          <Text className="text-gray-900 text-lg font-semibold text-center mb-2">Oops! Something went wrong</Text>
          <Text className="text-gray-500 text-center mb-6">{error}</Text>
          <TouchableOpacity onPress={() => fetchPosts()} className="bg-craftopia-primary px-6 py-3 rounded-lg">
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );

    if (posts.length === 0)
      return (
        <View className="flex-1 justify-center items-center py-20">
          <Text className="text-gray-400 text-center text-lg mb-4">No posts yet</Text>
          <TouchableOpacity onPress={handleRefresh} className="bg-craftopia-primary px-6 py-3 rounded-lg">
            <Text className="text-white font-semibold">Refresh</Text>
          </TouchableOpacity>
        </View>
      );

    return (
      <View className="px-4 pb-32">
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
          <View className="py-4 items-center">
            <ActivityIndicator size="small" color="#004E98" />
            <Text className="text-gray-500 mt-2 text-sm">Loading more...</Text>
          </View>
        )}

        {!hasMore && posts.length > 0 && (
          <View className="py-8 items-center">
            <Text className="text-gray-400 text-sm">You've reached the end!</Text>
          </View>
        )}
      </View>
    );
  };

  const handleCreate = () => {
    navigation.navigate('Create', { onPostCreated: handleRefresh });
  };

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-4 pb-2 border-b border-gray-100">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Feed</Text>
            <Text className="text-sm text-gray-600">Discover amazing projects</Text>
          </View>
          <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
            <Search size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          {FEED_TABS.map(renderTab)}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#004E98']} tintColor="#004E98" />}
      >
        {/* Trending Tags */}
        {activeTab === 'trending' && trendingTags.length > 0 && (
          <View className="bg-white px-4 py-4 border-b border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Trending Tags</Text>
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
        className="absolute bottom-24 right-6 w-14 h-14 bg-craftopia-primary rounded-full items-center justify-center shadow-lg"
        style={{ shadowColor: '#004E98', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

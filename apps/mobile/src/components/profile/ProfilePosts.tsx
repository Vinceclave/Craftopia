import React, { useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { FileText, Sparkles } from 'lucide-react-native';
import { useInfinitePosts } from '~/hooks/queries/usePosts';
import { PostContainer } from '~/components/feed/post/PostContainer';
import { useAuth } from '~/context/AuthContext';

export const ProfilePosts = () => {
  const { user } = useAuth();
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfinitePosts('all'); // Fetch all posts, we'll filter client-side

  // Filter posts to only show current user's posts
  const userPosts = React.useMemo(() => {
    if (!data?.pages || !user?.id) return [];
    
    return data.pages
      .flatMap(page => page.posts || [])
      .filter(post => post.user_id === user.id);
  }, [data, user?.id]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderPost = useCallback(({ item }: { item: any }) => (
    <PostContainer
      postId={item.post_id}
      user_id={item.user_id}
      title={item.title}
      content={item.content}
      image_url={item.image_url}
      category={item.category}
      tags={item.tags}
      featured={item.featured}
      commentCount={item.commentCount}
      likeCount={item.likeCount}
      isLiked={item.isLiked}
      created_at={item.created_at}
      updated_at={item.updated_at}
      deleted_at={item.deleted_at}
      user={item.user}
    />
  ), []);

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#3B6E4D" />
      </View>
    );
  };

  const renderEmpty = () => (
    <View className="px-4 py-12 items-center">
      <View className="w-16 h-16 rounded-2xl bg-craftopia-primary/5 items-center justify-center mb-4">
        <FileText size={28} color="#3B6E4D" />
      </View>
      <Text className="text-lg font-poppinsBold text-craftopia-textPrimary mb-2">
        No Posts Yet
      </Text>
      <Text className="text-sm font-nunito text-craftopia-textSecondary text-center max-w-64">
        Start sharing your crafting journey with the community
      </Text>
    </View>
  );

  // Loading State
  if (isLoading) {
    return (
      <View className="px-4 mb-6">
        <View className="flex-row items-center gap-2 mb-4">
          <View className="w-8 h-8 rounded-xl bg-craftopia-primary/10 items-center justify-center">
            <FileText size={16} color="#3B6E4D" />
          </View>
          <Text className="text-lg font-poppinsBold text-craftopia-textPrimary">
            My Posts
          </Text>
        </View>
        
        <View className="bg-craftopia-surface rounded-2xl p-8 items-center justify-center border border-craftopia-light shadow-sm">
          <ActivityIndicator size="small" color="#3B6E4D" />
          <Text className="text-sm font-nunito text-craftopia-textSecondary mt-3">
            Loading your posts...
          </Text>
        </View>
      </View>
    );
  }

  // Error State
  if (isError) {
    return (
      <View className="px-4 mb-6">
        <View className="flex-row items-center gap-2 mb-4">
          <View className="w-8 h-8 rounded-xl bg-craftopia-primary/10 items-center justify-center">
            <FileText size={16} color="#3B6E4D" />
          </View>
          <Text className="text-lg font-poppinsBold text-craftopia-textPrimary">
            My Posts
          </Text>
        </View>
        
        <View className="bg-craftopia-surface rounded-2xl p-8 items-center border border-craftopia-light shadow-sm">
          <Text className="text-sm font-nunito text-craftopia-error text-center">
            Failed to load posts. Please try again.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-6">
      {/* Section Header */}
      <View className="px-4 flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-xl bg-craftopia-primary/10 items-center justify-center">
            <FileText size={16} color="#3B6E4D" />
          </View>
          <Text className="text-lg font-poppinsBold text-craftopia-textPrimary">
            My Posts
          </Text>
        </View>
        
        <Text className="text-xs font-nunito text-craftopia-textSecondary">
          {userPosts.length} {userPosts.length === 1 ? 'post' : 'posts'}
        </Text>
      </View>

      {/* Posts List */}
      <FlatList
        data={userPosts}
        renderItem={renderPost}
        keyExtractor={(item) => `post-${item.post_id}`}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        scrollEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={['#3B6E4D']}
            tintColor="#3B6E4D"
          />
        }
        contentContainerStyle={{
          flexGrow: 1,
        }}
      />
    </View>
  );
};
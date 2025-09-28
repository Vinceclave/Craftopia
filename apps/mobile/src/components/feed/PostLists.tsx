import React from 'react';
import { FlatList, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { PostContainer } from './post/PostContainer';
import { Post } from '~/hooks/queries/usePosts';

interface PostListProps {
  posts: Post[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  refreshing: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export const PostList: React.FC<PostListProps> = ({
  posts,
  loading,
  error,
  onRefresh,
  refreshing,
  onLoadMore,
  hasMore,
  loadingMore,
}) => {
  const renderPost = ({ item }: { item: Post }) => (
    <PostContainer
      key={item.post_id}
      postId={item.post_id}
      {...item}
      // Remove comment reaction handler since it doesn't exist in schema
      onLoadComments={async (postId: number) => {
        // This will be handled by the useComments hook inside PostContainer
        return [];
      }}
      onAddComment={async (postId: number, content: string) => {
        // This will be handled by the useAddComment hook inside PostContainer
      }}
    />
  );

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View className="py-3 items-center">
          <ActivityIndicator size="small" color="#004E98" />
          <Text className="text-craftopia-textSecondary mt-1 text-xs">Loading more...</Text>
        </View>
      );
    }

    if (!hasMore && posts.length > 0) {
      return (
        <View className="py-4 items-center">
          <Text className="text-craftopia-textSecondary text-xs">You've reached the end!</Text>
        </View>
      );
    }

    return null;
  };

  const renderEmpty = () => {
    if (loading) {
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
          <Text className="text-craftopia-textPrimary text-base font-semibold text-center mb-1">
            Something went wrong
          </Text>
          <Text className="text-craftopia-textSecondary text-sm text-center mb-4">{error}</Text>
          <TouchableOpacity onPress={onRefresh} className="bg-craftopia-primary px-4 py-2 rounded-lg">
            <Text className="text-craftopia-surface text-sm font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="flex-1 justify-center items-center py-6">
        <Text className="text-craftopia-textSecondary text-center text-base mb-3">No posts yet</Text>
        <TouchableOpacity onPress={onRefresh} className="bg-craftopia-primary px-4 py-2 rounded-lg">
          <Text className="text-craftopia-surface text-sm font-medium">Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <FlatList
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item) => item.post_id.toString()}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      onRefresh={onRefresh}
      refreshing={refreshing}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.3}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ 
        paddingBottom: 80,
        flexGrow: 1 
      }}
    />
  );
};
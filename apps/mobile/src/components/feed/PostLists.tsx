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
    />
  );

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View className="py-6 items-center">
          <ActivityIndicator size="small" color="#5A7160" />
          <Text className="text-craftopa-textSecondary text-sm mt-2 font-nunito tracking-wide">
            Loading more posts...
          </Text>
        </View>
      );
    }

    if (!hasMore && posts.length > 0) {
      return (
        <View className="py-8 items-center">
          <Text className="text-craftopa-textSecondary text-sm font-nunito tracking-wide">
            🎉 You've reached the end!
          </Text>
        </View>
      );
    }

    return null;
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View className="flex-1 justify-center items-center py-12">
          <ActivityIndicator size="small" color="#5A7160" />
          <Text className="text-craftopa-textSecondary text-sm mt-3 font-nunito tracking-wide">
            Loading posts...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 justify-center items-center py-12 px-5">
          <Text className="text-craftopa-textPrimary text-lg font-poppinsBold text-center mb-2 tracking-tight">
            Something went wrong
          </Text>
          <Text className="text-craftopa-textSecondary text-sm text-center mb-4 font-nunito tracking-wide">
            {error}
          </Text>
          <TouchableOpacity 
            onPress={onRefresh} 
            className="bg-craftopa-primary px-6 py-3 rounded-xl active:opacity-70"
            activeOpacity={0.7}
          >
            <Text className="text-white text-sm font-poppinsBold tracking-tight">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="flex-1 justify-center items-center py-12 px-5">
        <Text className="text-craftopa-textSecondary text-center text-sm mb-4 font-nunito tracking-wide">
          No posts found
        </Text>
        <TouchableOpacity 
          onPress={onRefresh} 
          className="bg-craftopa-primary px-6 py-3 rounded-xl active:opacity-70"
          activeOpacity={0.7}
        >
          <Text className="text-white text-sm font-poppinsBold tracking-tight">Refresh</Text>
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
        paddingBottom: 20,
        flexGrow: 1 
      }}
    />
  ); 
};
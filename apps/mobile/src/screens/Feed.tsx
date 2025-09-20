import React, { useEffect, useState } from 'react';
import { 
  SafeAreaView, ScrollView, View, Text, TouchableOpacity, Image, 
  Alert, ActivityIndicator, RefreshControl 
} from 'react-native';
import { Search, FilterIcon, Plus, Camera, Heart, MessageCircle, Share2 } from 'lucide-react-native';
import { apiService } from '~/services/base.service';

interface Post {
  post_id: number;
  user_id: number;
  title: string;
  content: string;
  image_url: string;
  category: string;
  tags: string[];
  featured: boolean;
  commentCount: number;
  likeCount: number;
  isLiked?: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  user: {
    user_id: number;
    username: string;
  };
}

export const FeedScreen = () => {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [reactingPostId, setReactingPostId] = useState<number | null>(null);

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      const response = await apiService.request('api/v1/posts/');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert('Error', 'Failed to load posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts(); // initial fetch

    // Polling every 10 seconds to refresh feed
    const interval = setInterval(() => {
      fetchPosts();
    }, 10000);

    return () => clearInterval(interval); // cleanup
  }, []);

  // Pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
  };

  // Create post
  const handleCreate = async () => {
    setIsCreating(true);
    try {
      await apiService.request('api/v1/posts/', {
        method: 'POST',
        data: {
          title: 'My First Post',
          content: 'This is a test post',
          imageUrl: 'https://example.com/image.png',
          tags: ['test', 'post'],
          category: 'Social',
          featured: true,
        },
      });
      Alert.alert('Success', 'Post created successfully!');
      fetchPosts(); // refresh after creation
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to create post');
    } finally {
      setIsCreating(false);
    }
  };

  // Toggle like/unlike
  const toggleReaction = async (postId: number) => {
    if (reactingPostId === postId) return;
    setReactingPostId(postId);

    try {
      const response = await apiService.request(`api/v1/posts/${postId}/reaction/toggle`, { method: 'POST' });

      // Update local post immediately
      setPosts(prevPosts =>
        prevPosts?.map(post =>
          post.post_id === postId
            ? { ...post, likeCount: response.data.likeCount, isLiked: response.data.isLiked }
            : post
        ) || null
      );
    } catch (error: any) {
      console.error('Toggle reaction error:', error.message);
      Alert.alert('Error', 'Failed to toggle reaction');
    } finally {
      setReactingPostId(null);
    }
  };

  // Convert timestamp to "time ago"
  const timeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 relative">
      {/* Floating Background Shapes */}
      <View className="absolute inset-0 overflow-hidden">
        <View className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-emerald-400 opacity-10" />
        <View className="absolute top-64 -left-16 w-32 h-32 rounded-full bg-teal-500 opacity-8" />
      </View>

      <ScrollView
        className="px-6 pt-12 min-h-screen"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-sm font-semibold uppercase text-gray-700">Community Feed</Text>
            <Text className="text-3xl font-black text-blue-900 mt-1">Discover & Share</Text>
          </View>
          <View className="flex-row space-x-3">
            <TouchableOpacity className="w-12 h-12 bg-white rounded-xl items-center justify-center border border-gray-200 shadow-sm">
              <Search size={20} color="#1E40AF" />
            </TouchableOpacity>
            <TouchableOpacity className="w-12 h-12 bg-white rounded-xl items-center justify-center border border-gray-200 shadow-sm">
              <FilterIcon size={20} color="#1E40AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Posts */}
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#1E40AF" />
            <Text className="text-gray-500 mt-4">Loading posts...</Text>
          </View>
        ) : posts && posts.length > 0 ? (
          <View className="flex-1 gap-4 space-y-4">
            {posts.map((post) => (
              <View key={post.post_id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Post Header */}
                <View className="flex-row items-center p-4 pb-3">
                  <Image
                    source={{ uri: `https://i.pravatar.cc/40?u=${post.user.user_id}` }}
                    className="w-10 h-10 rounded-full"
                  />
                  <View className="flex-1 ml-3">
                    <Text className="font-semibold text-gray-900">{post.user.username}</Text>
                    <Text className="text-sm text-gray-500">{timeAgo(post.created_at)}</Text>
                  </View>
                  {post.featured && (
                    <View className="bg-yellow-100 px-2 py-1 rounded-md">
                      <Text className="text-xs font-medium text-yellow-700">FEATURED</Text>
                    </View>
                  )}
                </View>

                {/* Post Content */}
                <View className="px-4 pb-3">
                  <Text className="font-semibold text-gray-900 text-lg mb-2">{post.title}</Text>
                  <Text className="text-gray-700 leading-5">{post.content}</Text>
                  {post.tags.length > 0 && (
                    <View className="flex-row flex-wrap mt-3 gap-2">
                      {post.tags.map((tag, idx) => (
                        <View key={tag + idx} className="bg-blue-50 px-2 py-1 rounded-md">
                          <Text className="text-xs font-medium text-blue-700">#{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Post Image */}
                {post.image_url ? (
                  <Image
                    source={{ uri: post.image_url }}
                    className="w-full h-48"
                    style={{ resizeMode: 'cover' }}
                  />
                ) : (
                  <View className="w-full h-32 bg-gray-100 items-center justify-center">
                    <Camera size={24} color="#9CA3AF" />
                  </View>
                )}

                {/* Post Actions */}
                <View className="flex-row items-center justify-between p-4">
                  <View className="flex-row space-x-4">
                    <TouchableOpacity
                      className="flex-row items-center space-x-1"
                      onPress={() => toggleReaction(post.post_id)}
                      disabled={reactingPostId === post.post_id}
                    >
                      <Heart size={20} color={post.isLiked ? 'red' : '#6B7280'} />
                      <Text className="text-sm font-medium text-gray-600">{post.likeCount}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center space-x-1">
                      <MessageCircle size={20} color="#6B7280" />
                      <Text className="text-sm font-medium text-gray-600">{post.commentCount}</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity>
                    <Share2 size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <View className="bg-white rounded-3xl p-8 max-w-sm border border-gray-100">
              <View className="items-center">
                <View className="w-16 h-16 bg-blue-50 rounded-2xl items-center justify-center mb-4">
                  <Camera stroke="#1E40AF" width={28} height={28} />
                </View>
                <Text className="text-xl font-bold text-blue-900 mb-2">No Posts Yet</Text>
                <Text className="text-gray-500 text-center leading-6">
                  Be the first to share something amazing with the community!
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Create Post Button */}
      <View
        style={{
          position: 'absolute',
          bottom: 100,
          right: 24,
          zIndex: 1000,
        }}
      >
        <TouchableOpacity
          onPress={handleCreate}
          disabled={isCreating}
          style={{
            width: 64,
            height: 64,
            backgroundColor: '#2563EB',
            borderRadius: 32,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#1E40AF',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {isCreating ? (
            <ActivityIndicator color="white" />
          ) : (
            <Plus size={28} color="white" strokeWidth={2.5} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

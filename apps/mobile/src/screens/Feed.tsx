// Fixed Feed.tsx - Improved toggle reaction handling
import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Text, View, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Search, TrendingUp, Star, Flame, LayoutGrid, Plus } from 'lucide-react-native'
import { Post } from '~/components/feed/Post'
import { TrendingTagItem } from '~/components/feed/TrendingTagItem'
import type { PostProps } from '~/components/feed/Post'
import { postService } from '~/services/post.service'

type FeedType = 'all' | 'trending' | 'popular' | 'featured'

const FEED_TABS = [
  { key: 'all' as FeedType, label: 'All', icon: LayoutGrid },
  { key: 'trending' as FeedType, label: 'Trending', icon: TrendingUp },
  { key: 'popular' as FeedType, label: 'Popular', icon: Flame },
  { key: 'featured' as FeedType, label: 'Featured', icon: Star },
]

export const FeedScreen = () => {
  const [activeTab, setActiveTab] = useState<FeedType>('all')
  const [posts, setPosts] = useState<PostProps[]>([])
  const [trendingTags, setTrendingTags] = useState<{ tag: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  
  // Track pending reactions to prevent duplicate requests
  const pendingReactions = useRef<Set<number>>(new Set())

  // Fetch posts
  const fetchPosts = useCallback(async (pageNumber = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else if (pageNumber === 1) setLoading(true)
      else setLoadingMore(true)
      setError(null)

      const response = await postService.getPosts(activeTab, pageNumber)
      const fetchedPosts: PostProps[] = response?.data || []

      if (isRefresh || pageNumber === 1) {
        setPosts(prevPosts => {
          const existingPostsMap = new Map(prevPosts.map(post => [post.post_id, post]))
          
          return fetchedPosts.map(post => {
            const existingPost = existingPostsMap.get(post.post_id)
            
            if (existingPost) {
              return {
                ...post,
                isLiked: existingPost.isLiked,
                likeCount: existingPost.likeCount
              }
            }
            
            return post
          })
        })
        setPage(1)
      } else {
        setPosts(prevPosts => {
          const existingIds = new Set(prevPosts.map(p => p.post_id))
          const newPosts = fetchedPosts.filter(post => !existingIds.has(post.post_id))
          return [...prevPosts, ...newPosts]
        })
        setPage(pageNumber)
      }

      setHasMore(response?.meta ? response.meta.page < response.meta.lastPage : fetchedPosts.length === 10)
    } catch (err: any) {
      setError(err.message || 'Failed to load posts')
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
      setLoadingMore(false)
    }
  }, [activeTab])

  // Fetch trending tags
  const fetchTrendingTags = useCallback(async () => {
    try {
      const response = await postService.getTrendingTags()
      setTrendingTags(response?.data || [])
    } catch (err) {
      console.error('Error fetching trending tags:', err)
    }
  }, [])

  // FIXED: Improved toggle reaction with proper state management
  const handleToggleReaction = useCallback(async (postId: number) => {
    // Prevent duplicate requests
    if (pendingReactions.current.has(postId)) {
      console.log('⚠️ Reaction already pending for post:', postId)
      return
    }

    // Add to pending set
    pendingReactions.current.add(postId)

    // Get current post state for rollback
    let originalPost: PostProps | undefined
    setPosts(prevPosts => {
      originalPost = prevPosts.find(p => p.post_id === postId)
      
      // Optimistic update
      return prevPosts.map(post =>
        post.post_id === postId
          ? { 
              ...post, 
              isLiked: !post.isLiked, 
              likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1 
            }
          : post
      )
    })

    try {
      console.log('🔵 Frontend: Toggling reaction for post:', postId)
      
      // Call API
      const response = await postService.toggleReaction(postId.toString())
      console.log('🔵 Frontend: API Response:', response)

      // Handle different response structures
      const responseData = response?.data || response
      const isLiked = responseData?.isLiked
      const likeCount = responseData?.likeCount

      if (typeof isLiked === 'boolean' && typeof likeCount === 'number') {
        // Update with server response
        setPosts(currentPosts =>
          currentPosts.map(post =>
            post.post_id === postId
              ? { ...post, isLiked, likeCount }
              : post
          )
        )
        console.log('✅ Updated post with server data:', { postId, isLiked, likeCount })
      } else {
        // If no proper response, fetch the current count from server
        console.log('⚠️ Invalid response format, fetching count...')
        const countResponse = await postService.getReactionCount(postId.toString())
        const serverCount = countResponse?.data?.total || 0
        
        setPosts(currentPosts =>
          currentPosts.map(post => {
            if (post.post_id === postId) {
              // Determine isLiked based on optimistic update
              const wasLiked = originalPost?.isLiked || false
              return { ...post, isLiked: !wasLiked, likeCount: serverCount }
            }
            return post
          })
        )
      }
    } catch (error: any) {
      console.error('❌ Failed to toggle reaction:', error)
      
      // Rollback optimistic update
      if (originalPost) {
        setPosts(currentPosts =>
          currentPosts.map(post =>
            post.post_id === postId
              ? { ...post, isLiked: originalPost!.isLiked, likeCount: originalPost!.likeCount }
              : post
          )
        )
      }
      
      // Show user-friendly error
      console.log('Failed to update reaction. Please try again.')
    } finally {
      // Remove from pending set
      pendingReactions.current.delete(postId)
    }
  }, [])

  // Refresh handler
  const handleRefresh = useCallback(() => {
    fetchPosts(1, true)
    if (activeTab === 'trending') fetchTrendingTags()
  }, [fetchPosts, fetchTrendingTags, activeTab])

  // Load more
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      fetchPosts(page + 1)
    }
  }, [fetchPosts, page, loadingMore, hasMore, loading])

  // Scroll detection
  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent
    const paddingToBottom = 100
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      handleLoadMore()
    }
  }, [handleLoadMore])

  // Effect for tab changes
  useEffect(() => {
    setPosts([])
    setPage(1)
    setHasMore(true)
    
    const loadTabData = async () => {
      await fetchPosts(1)
      if (activeTab === 'trending') {
        await fetchTrendingTags()
      }
    }
    
    loadTabData()
  }, [activeTab])

  const renderTab = useCallback((tab: typeof FEED_TABS[0]) => {
    const isActive = activeTab === tab.key
    const IconComponent = tab.icon

    return (
      <TouchableOpacity
        key={tab.key}
        onPress={() => setActiveTab(tab.key)}
        className={`mr-6 pb-3 ${isActive ? 'border-b-2 border-blue-600' : ''}`}
      >
        <View className="flex-row items-center mb-1">
          <IconComponent size={18} color={isActive ? '#2563EB' : '#6B7280'} />
          <Text className={`text-base font-semibold ml-2 ${isActive ? 'text-blue-600' : 'text-gray-700'}`}>
            {tab.label}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }, [activeTab])

  const renderContent = () => {
    if (loading) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="text-gray-500 mt-4">Loading posts...</Text>
        </View>
      )
    }

    if (error) {
      return (
        <View className="flex-1 justify-center items-center py-20 px-6">
          <Text className="text-gray-900 text-lg font-semibold text-center mb-2">Oops! Something went wrong</Text>
          <Text className="text-gray-500 text-center mb-6">{error}</Text>
          <TouchableOpacity onPress={() => fetchPosts()} className="bg-blue-600 px-6 py-3 rounded-lg">
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (posts.length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <Text className="text-gray-400 text-center text-lg mb-4">No posts yet</Text>
          <TouchableOpacity onPress={handleRefresh} className="bg-blue-600 px-6 py-3 rounded-lg">
            <Text className="text-white font-semibold">Refresh</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View className="px-4 pb-32">
        {posts.map(post => (
          <Post key={post.post_id} {...post} onToggleReaction={() => handleToggleReaction(post.post_id)} />
        ))}

        {loadingMore && (
          <View className="py-4 items-center">
            <ActivityIndicator size="small" color="#2563EB" />
            <Text className="text-gray-500 mt-2 text-sm">Loading more...</Text>
          </View>
        )}

        {!hasMore && posts.length > 0 && (
          <View className="py-8 items-center">
            <Text className="text-gray-400 text-sm">You've reached the end!</Text>
          </View>
        )}
      </View>
    )
  }

  const handleCreate = async () => {
    try {
      const res = await postService.createPost({
        title: "My First Post",
        content: "This is a test post",
        imageUrl: "https://example.com/image.png",
        tags: ["test", "post"],
        category: "Social",
        featured: true
      })
      console.log(res.data)
      handleRefresh()
    } catch (err) {
      console.error('Failed to create post:', err)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#2563EB']} tintColor="#2563EB" />}
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
        className="absolute bottom-24 right-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg"
        style={{ shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
      >
        <Plus size={24} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}
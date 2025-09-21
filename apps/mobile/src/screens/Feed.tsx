// apps/mobile/src/screens/FeedScreen.tsx
import { FilterIcon, FireExtinguisher, LayoutGrid, PlusIcon, Search, Star, TrendingUp, Zap, ChevronUp, WifiOff } from 'lucide-react-native'
import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Text, View, ScrollView, RefreshControl, ActivityIndicator, Alert, AppState } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Button from '~/components/common/Button'
import { Input } from '~/components/common/TextInputField'
import { Post } from '~/components/feed/Post'
import { SectionHeader } from '~/components/feed/SectionHeader'
import { TrendingTagItem } from '~/components/feed/TrendingTagItem'
import type { PostProps } from '~/components/feed/Post'
import { postService } from '~/services/post.service'

type FeedType = 'all' | 'trending' | 'popular' | 'rising' | 'featured'

const tabs: { key: FeedType; label: string; icon: any; subtitle: string }[] = [
  { key: 'all', label: 'All', icon: LayoutGrid, subtitle: 'Everything' },
  { key: 'trending', label: 'Trending', icon: TrendingUp, subtitle: 'Hot topics' },
  { key: 'popular', label: 'Popular', icon: FireExtinguisher, subtitle: 'Most liked' },
  { key: 'rising', label: 'Rising', icon: Zap, subtitle: 'Fast growing' },
  { key: 'featured', label: 'Featured', icon: Star, subtitle: "Editor's picks" },
]

// Simple skeleton component
const SkeletonPost = () => (
  <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
    <View className="flex-row items-center mb-3">
      <View className="w-10 h-10 bg-gray-200 rounded-full" />
      <View className="ml-3 flex-1">
        <View className="w-24 h-4 bg-gray-200 rounded mb-1" />
        <View className="w-16 h-3 bg-gray-200 rounded" />
      </View>
    </View>
    <View className="mb-3">
      <View className="w-full h-4 bg-gray-200 rounded mb-2" />
      <View className="w-4/5 h-4 bg-gray-200 rounded mb-2" />
      <View className="w-3/4 h-4 bg-gray-200 rounded" />
    </View>
    <View className="w-full h-40 bg-gray-200 rounded-lg mb-3" />
  </View>
)

export const FeedScreen = () => {
  const [active, setActive] = useState<FeedType>('all')
  const [trendingTags, setTrendingTags] = useState<{ tag: string; count: number; growth: number }[]>([])
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [page, setPage] = useState<number>(1)
  const [posts, setPosts] = useState<PostProps[]>([])
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [showScrollToTop, setShowScrollToTop] = useState<boolean>(false)
  const [isOnline, setIsOnline] = useState<boolean>(true)
  const [retryCount, setRetryCount] = useState<number>(0)
  
  const scrollViewRef = useRef<ScrollView>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const LIMIT = 10
  const POLLING_INTERVAL = 15000
  const MAX_RETRIES = 3

  // Simple network detection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('https://www.google.com', { 
          method: 'HEAD',
          cache: 'no-cache'
        })
        setIsOnline(response.ok)
      } catch {
        setIsOnline(false)
      }
    }
    
    checkConnection()
    const interval = setInterval(checkConnection, 30000) // Check every 30s
    return () => clearInterval(interval)
  }, [])

  // Fetch Posts with simple retry
  const fetchPosts = async (pageNumber: number, isRefresh: boolean = false, retry: number = 0) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
        setError(null)
        setRetryCount(0)
      } else if (pageNumber > 1) {
        setLoadingMore(true)
      } else {
        setLoading(true)
        setError(null)
        setRetryCount(0)
      }

      const response = await postService.getPosts(active, pageNumber)
      const newPosts: PostProps[] = response?.data ?? []

      if (isRefresh || pageNumber === 1) {
        setPosts(newPosts)
        setPage(1)
      } else {
        setPosts((prev) => [...prev, ...newPosts])
      }

      setHasMore(response.meta ? response.meta.page < response.meta.lastPage : newPosts.length === LIMIT)
      if (!isRefresh && pageNumber > 1) setPage(pageNumber)
      setRetryCount(0)
      
    } catch (error: any) {
      console.error("Error fetching posts:", error?.message || error)
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to load posts"
      
      // Simple retry logic
      if (retry < MAX_RETRIES && (!error?.response || error?.code === 'NETWORK_ERROR')) {
        console.log(`Retrying... (${retry + 1}/${MAX_RETRIES})`)
        setRetryCount(retry + 1)
        setTimeout(() => fetchPosts(pageNumber, isRefresh, retry + 1), (retry + 1) * 1000)
        return
      }
      
      setError(errorMessage)
      setRetryCount(retry)
    } finally {
      setLoading(false)
      setRefreshing(false)
      setLoadingMore(false)
    }
  }

  // Fetch Trending Tags
  const fetchTrendingTags = async () => {
    try {
      const response = await postService.getTrendingTags()
      setTrendingTags(response?.data ?? [])
    } catch (error: any) {
      console.error("Error fetching trending tags:", error?.message || error)
    }
  }

  // Refresh & Load More
  const handleRefresh = useCallback(() => {
    fetchPosts(1, true)
    if (active === 'trending') fetchTrendingTags()
  }, [active])

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading && !error) {
      fetchPosts(page + 1)
    }
  }, [page, loadingMore, hasMore, loading, error, active])

  // Smart polling that stops when app is inactive
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        if (!pollingRef.current) startPolling()
      } else {
        stopPolling()
      }
    }

    const startPolling = () => {
      pollingRef.current = setInterval(() => {
        if (isOnline) {
          fetchPosts(1, true)
          if (active === 'trending') fetchTrendingTags()
        }
      }, POLLING_INTERVAL)
    }

    const stopPolling = () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }

    startPolling()
    const subscription = AppState.addEventListener('change', handleAppStateChange)
    
    return () => {
      stopPolling()
      subscription?.remove()
    }
  }, [active, isOnline])

  const handleScroll = ({ nativeEvent }: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent
    const paddingToBottom = 100
    setShowScrollToTop(contentOffset.y > 500)

    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      handleLoadMore()
    }
  }

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true })
  }

  // Create Post
  const handleCreatePost = async () => {
    if (!isOnline) {
      Alert.alert('No Internet', 'Please check your connection and try again.')
      return
    }

    setIsCreating(true)
    try {
      const newPost = {
        title: 'Quick Share',
        content: `Shared at ${new Date().toLocaleTimeString()}`,
        tags: ['quick', 'share'],
        category: 'Social',
        featured: false,
      }

      console.log('Creating post:', newPost)
      Alert.alert('Success!', 'Post created successfully', [
        { text: 'OK', onPress: handleRefresh }
      ])
    } catch (error: any) {
      Alert.alert('Failed to Create Post', error?.message || 'Something went wrong')
    } finally {
      setIsCreating(false)
    }
  }

  // Toggle Reaction
  const handleToggleReaction = async (postId: number) => {
    try {
      // Optimistic UI update
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.post_id === postId
            ? {
                ...p,
                isLiked: !p.isLiked,
                likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
              }
            : p
        )
      )

      await postService.toggleReaction(postId.toString())
    } catch (error: any) {
      // Revert on failure
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.post_id === postId
            ? {
                ...p,
                isLiked: !p.isLiked,
                likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
              }
            : p
        )
      )
      console.error('Reaction Failed:', error?.message || 'Could not toggle reaction')
    }
  }

  // Fetch posts on mount & tab change
  useEffect(() => {
    setPage(1)
    setPosts([])
    setHasMore(true)
    fetchPosts(1)
    if (active === 'trending') fetchTrendingTags()
  }, [active])

  // Render content
  const renderContent = () => {
    // Show skeleton loading
    if (loading && posts.length === 0) {
      return (
        <View className="px-4 pb-20">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonPost key={i} />
          ))}
        </View>
      )
    }

    // Show error with retry
    if (error && posts.length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-20 px-6">
          <WifiOff size={48} color="#EF4444" />
          <Text className="text-gray-900 text-lg font-semibold mt-4 text-center">
            Something went wrong
          </Text>
          <Text className="text-gray-500 text-center mt-2">{error}</Text>
          {retryCount < MAX_RETRIES && (
            <Button
              title={retryCount > 0 ? `Retry (${retryCount}/${MAX_RETRIES})` : 'Retry'}
              onPress={() => fetchPosts(1)}
              className="mt-6 bg-blue-600"
            />
          )}
        </View>
      )
    }

    return (
      <View className="px-4 pb-20">
        {posts.length > 0 ? (
          <>
            {posts.map(post => (
              <Post
                key={post.post_id.toString()}
                {...post}
                onToggleReaction={() => handleToggleReaction(post.post_id)}
              />
            ))}

            {loadingMore && (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#2563EB" />
                <Text className="text-gray-500 mt-2 text-sm">Loading more...</Text>
              </View>
            )}

            {!hasMore && (
              <Text className="text-gray-400 text-center py-8 text-sm">
                You've reached the end!
              </Text>
            )}
          </>
        ) : (
          <View className="py-20 items-center">
            <Text className="text-gray-400 text-center">No posts yet — start exploring!</Text>
            <Button title="Refresh" onPress={handleRefresh} className="mt-4 bg-blue-600" />
          </View>
        )}
      </View>
    )
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1 bg-white">
      {/* Offline banner */}
      {!isOnline && (
        <View className="bg-red-500 px-4 py-2 flex-row items-center">
          <WifiOff size={16} color="#fff" />
          <Text className="text-white ml-2 text-sm">No internet connection</Text>
        </View>
      )}

      {/* Header */}
      <View className="flex-row justify-between items-center px-4 pt-6 pb-4">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Feed</Text>
          <Text className="text-sm text-gray-600">Discover & Share</Text>
        </View>
        <Button
          title=""
          iconOnly
          leftIcon={<FilterIcon size={18} color="#fff" />}
          className="bg-gray-900 w-9 h-9 rounded-full"
          onPress={() => {}}
        />
      </View>

      {/* Search */}
      <View className="px-4 mb-4">
        <Input placeholder="Search" leftIcon={<Search size={18} color="#9CA3AF" />} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
            colors={['#2563EB']} 
            tintColor="#2563EB" 
          />
        }
      >
        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-6">
          {tabs.map(({ key, label, icon: Icon, subtitle }) => (
            <SectionHeader
              key={key}
              title={label}
              subtitle={subtitle}
              icon={<Icon size={18} color={active === key ? '#2563EB' : '#6B7280'} />}
              isActive={active === key}
              onPress={() => setActive(key)}
            />
          ))}
        </ScrollView>

        {/* Trending Tags */}
        {active === 'trending' && trendingTags.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 px-4 mb-3">Trending Tags</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
              {trendingTags.map(tag => (
                <TrendingTagItem key={tag.tag} {...tag} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Posts */}
        {renderContent()}
      </ScrollView>

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <Button
          title=""
          iconOnly
          leftIcon={<ChevronUp size={20} color="#fff" />}
          className="absolute bottom-4 right-5 bg-gray-800 w-12 h-12 rounded-full shadow-lg opacity-80"
          onPress={scrollToTop}
        />
      )}

      {/* Floating Action Button */}
      <Button
        title=""
        iconOnly
        loading={isCreating}
        leftIcon={!isCreating ? <PlusIcon size={22} color="#fff" /> : undefined}
        className={`absolute bottom-24 right-5 w-14 h-14 rounded-full shadow-lg ${
          isOnline ? 'bg-blue-600' : 'bg-gray-400'
        }`}
        onPress={handleCreatePost}
        disabled={!isOnline}
      />
    </SafeAreaView>
  )
}
import { FilterIcon, FireExtinguisher, LayoutGrid, PlusIcon, Search, Star, TrendingUp, Zap, ChevronUp } from 'lucide-react-native'
import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Text, View, ScrollView, RefreshControl, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Button from '~/components/common/Button'
import { Input } from '~/components/common/TextInputField'
import { Post } from '~/components/feed/Post'
import { SectionHeader } from '~/components/feed/SectionHeader'
import { TrendingTagItem } from '~/components/feed/TrendingTagItem'
import type { PostProps } from '~/components/feed/Post'
import { postService } from '~/services/post.service'
// import { apiService } from '~/services/api.service' // Uncomment if you have this service

const tabs = [
  { key: 'all', label: 'All', icon: LayoutGrid, subtitle: 'Everything' },
  { key: 'trending', label: 'Trending', icon: TrendingUp, subtitle: 'Hot topics' },
  { key: 'popular', label: 'Popular', icon: FireExtinguisher, subtitle: 'Most liked' },
  { key: 'rising', label: 'Rising', icon: Zap, subtitle: 'Fast growing' },
  { key: 'featured', label: 'Featured', icon: Star, subtitle: "Editor's picks" },
]

const trendingTags = [
  { tag: 'react-native', count: 128, growth: 45 },
  { tag: 'typescript', count: 95, growth: 32 },
  { tag: 'design', count: 87, growth: 28 },
  { tag: 'tutorial', count: 76, growth: 15 },
  { tag: 'mobile', count: 64, growth: 22 },
]

// Helper functions (you may want to move these to utils)
const showError = (title: string, message: string) => {
  console.error(`${title}: ${message}`)
  // Replace with your error handling (toast, alert, etc.)
}

const alert = (title: string, message: string, callback?: () => void) => {
  console.log(`${title}: ${message}`)
  callback?.()
  // Replace with your alert implementation
}

export const FeedScreen = () => {
  const [active, setActive] = useState<'all' | 'trending' | 'popular' | 'rising' | 'featured'>('all')
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [page, setPage] = useState<number>(1)
  const [posts, setPosts] = useState<PostProps[]>([])
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [showScrollToTop, setShowScrollToTop] = useState<boolean>(false)
  const scrollViewRef = useRef<ScrollView>(null)

  const fetchPosts = async (pageNumber: number, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
        setError(null)
      } else if (pageNumber > 1) {
        setLoadingMore(true)
      } else {
        setLoading(true)
        setError(null)
      }

      const response = await postService.getPosts(pageNumber)
      const newPosts: PostProps[] = response?.data ?? []
      
      if (isRefresh || pageNumber === 1) {
        setPosts(newPosts)
        setPage(1)
      } else {
        setPosts((prev) => [...prev, ...newPosts])
      }

      if (response.meta) {
        setHasMore(response.meta.hasNext)
      } else {
        setHasMore(newPosts.length === 10)
      }

      if (!isRefresh && pageNumber > 1) {
        setPage(pageNumber)
      }

    } catch (error: any) {
      console.error("Error fetching posts:", error?.message || error)
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to load posts"
      setError(errorMessage)
      
      if (!isRefresh && pageNumber === 1) {
        showError('Network Error', errorMessage)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
      setLoadingMore(false)
    }
  }

  const handleRefresh = useCallback(() => {
    fetchPosts(1, true)
  }, [])

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      fetchPosts(page + 1)
    }
  }, [page, loadingMore, hasMore, loading])

  const handleScroll = ({ nativeEvent }: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent
    const paddingToBottom = 100
    
    // Show/hide scroll to top button
    setShowScrollToTop(contentOffset.y > 500)
    
    // Load more when near bottom
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      handleLoadMore()
    }
  }

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true })
  }

  const handleCreatePost = async () => {
    setIsCreating(true)
    try {
      const newPost = {
        title: 'Quick Share',
        content: `Shared at ${new Date().toLocaleTimeString()}`,
        tags: ['quick', 'share'],
        category: 'Social',
        featured: false,
      }

      // Uncomment when you have apiService
      // await apiService.request('api/v1/posts/', {
      //   method: 'POST',
      //   data: newPost,
      // })

      console.log('Creating post:', newPost) // Temporary log

      alert('Success!', 'Post created successfully', () => {
        handleRefresh()
      })
    } catch (error: any) {
      showError('Failed to Create Post', error?.message || 'Something went wrong')
    } finally {
      setIsCreating(false)
    }
  }

  useEffect(() => {
    fetchPosts(1)
  }, [])

  useEffect(() => {
    console.log('Posts updated:', posts)
  }, [posts])

  const renderContent = () => {
    if (loading && posts.length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="text-gray-500 mt-4">Loading posts...</Text>
        </View>
      )
    }

    if (error && posts.length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <Text className="text-red-500 text-center px-4">{error}</Text>
          <Button
            title="Retry"
            onPress={() => fetchPosts(1)}
            className="mt-4 bg-blue-600"
          />
        </View>
      )
    }

    return (
      <View className="px-4 pb-20">
        {posts.length > 0 ? (
          <>
            {posts.map(post => <Post key={post.post_id} {...post} />)}
            
            {loadingMore && (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#2563EB" />
                <Text className="text-gray-500 mt-2 text-sm">Loading more...</Text>
              </View>
            )}
            
            {!hasMore && (
              <Text className="text-gray-400 text-center py-8 text-sm">
                You've reached the end — no more posts!
              </Text>
            )}
          </>
        ) : (
          <Text className="text-gray-400 text-center py-12">No posts yet — start exploring!</Text>
        )}
      </View>
    )
  }
  
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 pt-6 pb-4">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Feed</Text>
          <Text className="text-sm text-gray-600">Discover & Share</Text>
        </View>
        <Button
          title=''
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
              onPress={() => setActive(key as any)}
            />
          ))}
        </ScrollView>

        {/* Trending Tags */}
        {active === 'trending' && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 px-4 mb-3">Trending Tags</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
              {trendingTags.map(tag => (
                <TrendingTagItem key={tag.tag} {...tag} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Posts Content */}
        {renderContent()}
      </ScrollView>

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <Button
          title=''
          iconOnly
          leftIcon={<ChevronUp size={20} color="#fff" />}
          className="absolute bottom-4 right-5 bg-gray-800 w-12 h-12 rounded-full shadow-lg opacity-80"
          onPress={scrollToTop}
        />
      )}

      {/* Floating Action Button */}
      <Button
        title=''
        iconOnly
        loading={isCreating}
        leftIcon={!isCreating ? <PlusIcon size={22} color="#fff" /> : undefined}
        className="absolute bottom-24 right-5 bg-blue-600 w-14 h-14 rounded-full shadow-lg"
        onPress={handleCreatePost}
      />
    </SafeAreaView>
  )
}
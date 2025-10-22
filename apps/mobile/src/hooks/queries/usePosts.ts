// apps/mobile/src/hooks/queries/usePosts.ts - FIXED VERSION
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { postService } from '~/services/post.service';
import { useAuth } from '~/context/AuthContext';

export type FeedType = 'all' | 'trending' | 'popular' | 'featured';

export interface Post {
  post_id: number;
  user_id: number;
  title: string;
  content: string;
  image_url?: string;
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

export interface CreatePostPayload {
  title: string;
  content: string;
  imageUrl?: string;
  tags?: string[];
  category?: 'Social' | 'Tutorial' | 'Challenge' | 'Marketplace' | 'Other';
  featured?: boolean;
}

export interface TrendingTag {
  tag: string;
  count: number;
  growth?: number;
}

export interface Comment {
  comment_id: number;
  user_id: number;
  content: string;
  created_at: string;
  user: {
    user_id: number;
    username: string;
  };
}

// Query keys for posts
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (feedType: FeedType) => [...postKeys.lists(), feedType] as const,
  infinite: (feedType: FeedType) => [...postKeys.list(feedType), 'infinite'] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: number) => [...postKeys.details(), id] as const,
  trending: () => [...postKeys.all, 'trending'] as const,
  trendingTags: () => [...postKeys.trending(), 'tags'] as const,
  comments: (postId: number) => [...postKeys.detail(postId), 'comments'] as const,
};

/**
 * Infinite query for posts with pagination
 */
export const useInfinitePosts = (feedType: FeedType) => {
  return useInfiniteQuery({
    queryKey: postKeys.infinite(feedType),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await postService.getPosts(feedType, pageParam);
      return {
        posts: response.data || [],
        meta: response.pagination,
        nextPage: response.pagination && pageParam < response.pagination.lastPage ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Regular query for posts (first page only)
 */
export const usePosts = (feedType: FeedType, page: number = 1) => {
  return useQuery({
    queryKey: [...postKeys.list(feedType), { page }], // Include page in key
    queryFn: async () => {
      const response = await postService.getPosts(feedType, page);
      return response.data || [];
    },
    staleTime: 30 * 1000, // Reduced from 2 minutes to 30 seconds for faster updates
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Get single post by ID
 */
export const usePost = (postId: number) => {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: async () => {
      const response = await postService.getPostById(postId.toString());
      return response.data;
    },
    enabled: !!postId,
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Get trending tags
 */
export const useTrendingTags = () => {
  return useQuery({
    queryKey: postKeys.trendingTags(),
    queryFn: async () => {
      const response = await postService.getTrendingTags();
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Create new post mutation
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePostPayload) => {
      const response = await postService.createPost(payload);
      return response.data;
    },
    onSuccess: (newPost) => {
      // Invalidate all post lists to refetch with new post
      queryClient.invalidateQueries({
        queryKey: postKeys.lists(),
      });

      // Add the new post to the cache
      if (newPost?.post_id) {
        queryClient.setQueryData(postKeys.detail(newPost.post_id), newPost);
      }
    },
    onError: (error) => {
      console.error('Failed to create post:', error);
    },
  });
};

/**
 * Toggle post reaction (like/unlike) with optimistic updates
 */
export const useTogglePostReaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (postId: number) => {
      console.log('🔵 Frontend: Toggling reaction for post:', postId);
      const response = await postService.toggleReaction(postId.toString());
      console.log('🔵 Frontend: Toggle response:', response.data);
      return { postId, ...response.data };
    },
    onMutate: async (postId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: postKeys.lists() });

      // Get current state
      const previousLists = queryClient.getQueriesData({ queryKey: postKeys.lists() });

      // Optimistically update
      queryClient.setQueriesData(
        { queryKey: postKeys.lists() },
        (oldData: any) => {
          if (!oldData) return oldData;

          const updatePost = (post: any) => {
            if (post.post_id !== postId) return post;
            
            const newIsLiked = !post.isLiked;
            const newLikeCount = newIsLiked 
              ? post.likeCount + 1 
              : Math.max(0, post.likeCount - 1);
            
            console.log('🔄 Optimistic update:', {
              postId,
              oldLiked: post.isLiked,
              newLiked: newIsLiked,
              oldCount: post.likeCount,
              newCount: newLikeCount
            });
            
            return {
              ...post,
              isLiked: newIsLiked,
              likeCount: newLikeCount,
            };
          };

          // Handle array structure
          if (Array.isArray(oldData)) {
            return oldData.map(updatePost);
          }

          // Handle infinite query structure
          if (oldData.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                posts: page.posts?.map(updatePost) || [],
              })),
            };
          }

          return oldData;
        }
      );

      return { previousLists };
    },
    onError: (err, postId, context) => {
      console.error('❌ Toggle reaction failed:', err);
      
      // Revert on error
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (data, postId) => {
      console.log('✅ Toggle reaction success:', {
        postId,
        isLiked: data.isLiked,
        likeCount: data.likeCount
      });
      
      // Update with server response
      queryClient.setQueriesData(
        { queryKey: postKeys.lists() },
        (oldData: any) => {
          if (!oldData) return oldData;

          const updatePost = (post: any) =>
            post.post_id === postId
              ? {
                  ...post,
                  isLiked: data.isLiked,
                  likeCount: data.likeCount,
                }
              : post;

          if (Array.isArray(oldData)) {
            return oldData.map(updatePost);
          }

          if (oldData.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                posts: page.posts?.map(updatePost) || [],
              })),
            };
          }

          return oldData;
        }
      );
    },
  });
};

/**
 * Delete post mutation
 */
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: number) => {
      await postService.deletePost(postId.toString());
      return postId;
    },
    onSuccess: (postId) => {
      // Remove from all cached lists
      queryClient.setQueriesData(
        { queryKey: postKeys.lists() },
        (oldData: any) => {
          if (!oldData) return oldData;

          // Handle array structure
          if (Array.isArray(oldData)) {
            return oldData.filter((post: Post) => post.post_id !== postId);
          }

          // Handle infinite query structure
          if (oldData.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                posts: page.posts?.filter((post: Post) => post.post_id !== postId) || [],
              })),
            };
          }

          return oldData;
        }
      );

      // Remove individual post from cache
      queryClient.removeQueries({ queryKey: postKeys.detail(postId) });
    },
  });
};

/**
 * Get comments for a post
 */
export const useComments = (postId: number) => {
  return useQuery({
    queryKey: postKeys.comments(postId),
    queryFn: async (): Promise<Comment[]> => {
      try {
        const response = await postService.getComments(postId.toString());
        return response.data || [];
      } catch (error) {
        console.error('Failed to load comments:', error);
        return [];
      }
    },
    enabled: !!postId,
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Add comment mutation
 */
export const useAddComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      const response = await postService.addComment({ postId, content });
      return { postId, comment: response.data };
    },
    onMutate: async ({ postId, content }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: postKeys.comments(postId) });

      // Snapshot previous value
      const previousComments = queryClient.getQueryData(postKeys.comments(postId));

      // Optimistically add new comment
      if (user) {
        const optimisticComment: Comment = {
          comment_id: Date.now(), // Temporary ID
          user_id: user.id,
          content,
          created_at: new Date().toISOString(),
          user: {
            user_id: user.id,
            username: user.username,
          },
        };

        queryClient.setQueryData(
          postKeys.comments(postId),
          (old: Comment[] = []) => [...old, optimisticComment]
        );
      }

      return { previousComments };
    },
    onError: (err, { postId }, context) => {
      console.error('Failed to add comment:', err);
      
      // Revert optimistic update
      if (context?.previousComments) {
        queryClient.setQueryData(postKeys.comments(postId), context.previousComments);
      }
    },
    onSuccess: ({ postId, comment }) => {
      // Replace optimistic comment with real one
      queryClient.setQueryData(
        postKeys.comments(postId),
        (oldComments: Comment[] = []) => {
          // Remove optimistic comment and add real one
          const withoutOptimistic = oldComments.filter(c => c.comment_id < 1000000000000);
          return [...withoutOptimistic, comment];
        }
      );

      // Update comment count in posts
      queryClient.setQueriesData(
        { queryKey: postKeys.lists() },
        (oldData: any) => {
          if (!oldData) return oldData;

          const updatePost = (post: Post) =>
            post.post_id === postId
              ? { ...post, commentCount: post.commentCount + 1 }
              : post;

          // Handle array structure
          if (Array.isArray(oldData)) {
            return oldData.map(updatePost);
          }

          // Handle infinite query structure
          if (oldData.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                posts: page.posts?.map(updatePost) || [],
              })),
            };
          }

          return oldData;
        }
      );
    },
  });
};
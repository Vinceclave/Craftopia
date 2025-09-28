// hooks/queries/usePosts.ts - Complete implementation
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
        meta: response.meta,
        nextPage: response.meta && pageParam < response.meta.lastPage ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Regular query for posts (first page only)
 */
export const usePosts = (feedType: FeedType, page: number = 1) => {
  return useQuery({
    queryKey: [...postKeys.list(feedType), page],
    queryFn: async () => {
      const response = await postService.getPosts(feedType, page);
      return response.data || [];
    },
    staleTime: 2 * 60 * 1000,
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

      // Optionally add the new post to the cache immediately
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
 * Toggle post reaction (like/unlike)
 */
export const useTogglePostReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: number) => {
      const response = await postService.toggleReaction(postId.toString());
      return { postId, ...response.data };
    },
    onMutate: async (postId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) });

      // Snapshot the previous value
      const previousPost = queryClient.getQueryData(postKeys.detail(postId));

      // Optimistically update the cache
      queryClient.setQueriesData(
        { queryKey: postKeys.lists() },
        (oldData: any) => {
          if (!oldData) return oldData;

          // Handle infinite query structure
          if (oldData.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                posts: page.posts?.map((post: Post) =>
                  post.post_id === postId
                    ? {
                        ...post,
                        isLiked: !post.isLiked,
                        likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
                      }
                    : post
                ) || [],
              })),
            };
          }

          // Handle regular array structure
          if (Array.isArray(oldData)) {
            return oldData.map((post: Post) =>
              post.post_id === postId
                ? {
                    ...post,
                    isLiked: !post.isLiked,
                    likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
                  }
                : post
            );
          }

          return oldData;
        }
      );

      return { previousPost };
    },
    onError: (err, postId, context) => {
      // Revert the optimistic update
      if (context?.previousPost) {
        queryClient.setQueryData(postKeys.detail(postId), context.previousPost);
      }
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
    onSettled: (data, error, postId) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
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
      // Remove the post from all cached lists
      queryClient.setQueriesData(
        { queryKey: postKeys.lists() },
        (oldData: any) => {
          if (!oldData) return oldData;

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

          // Handle regular array structure
          if (Array.isArray(oldData)) {
            return oldData.filter((post: Post) => post.post_id !== postId);
          }

          return oldData;
        }
      );

      // Remove the individual post from cache
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
        // Return empty array if API fails
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
    onSuccess: ({ postId, comment }) => {
      // Add the new comment to the cache
      queryClient.setQueryData(
        postKeys.comments(postId),
        (oldComments: Comment[] = []) => [...oldComments, comment]
      );

      // Update the post's comment count
      queryClient.setQueriesData(
        { queryKey: postKeys.lists() },
        (oldData: any) => {
          if (!oldData) return oldData;

          const updatePost = (post: Post) =>
            post.post_id === postId
              ? { ...post, commentCount: post.commentCount + 1 }
              : post;

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

          // Handle regular array structure
          if (Array.isArray(oldData)) {
            return oldData.map(updatePost);
          }

          return oldData;
        }
      );
    },
    onError: (error) => {
      console.error('Failed to add comment:', error);
    },
  });
};
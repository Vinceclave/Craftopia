// apps/web/src/hooks/usePosts.ts
// Custom React Query hook for managing posts and comments in the moderation dashboard

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moderationAPI } from '../lib/api';
import { useState } from 'react';
import type { Post, Comment, ApiResponse } from '../lib/api';

export const usePosts = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const queryClient = useQueryClient();

  /**
   * Fetch posts and comments pending for moderation
   */
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['content-review', page, limit],
    queryFn: async () => {
      const response: ApiResponse<{ posts: Post[]; comments: Comment[]; meta: Record<string, any> }> =
        await moderationAPI.getContentForReview(page, limit);

      const { posts = [], comments = [], meta = {} } = response.data || {};
      return { posts, comments, meta };
    },
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  /**
   * Delete a single post (with optional reason)
   */
  const deletePostMutation = useMutation({
    mutationFn: async ({ postId, reason }: { postId: number; reason?: string }) =>
      await moderationAPI.deletePost(postId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-review'] });
    },
  });

  /**
   * Delete a single comment (with optional reason)
   */
  const deleteCommentMutation = useMutation({
    mutationFn: async ({ commentId, reason }: { commentId: number; reason?: string }) =>
      await moderationAPI.deleteComment(commentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-review'] });
    },
  });

  /**
   * Toggle featured status on a post
   */
  const featurePostMutation = useMutation({
    mutationFn: async (postId: number) => await moderationAPI.featurePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-review'] });
    },
  });

  /**
   * Restore a previously deleted post
   */
  const restorePostMutation = useMutation({
    mutationFn: async (postId: number) => await moderationAPI.restorePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-review'] });
    },
  });

  /**
   * Bulk delete multiple posts
   */
  const bulkDeleteMutation = useMutation({
    mutationFn: async ({ postIds, reason }: { postIds: number[]; reason?: string }) =>
      await moderationAPI.bulkDeletePosts(postIds, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-review'] });
    },
  });

  return {
    posts: data?.posts || [],
    comments: data?.comments || [],
    meta: data?.meta || {},
    isLoading,
    error,
    page,
    setPage,
    refetch,
    deletePost: deletePostMutation.mutateAsync,
    deleteComment: deleteCommentMutation.mutateAsync,
    featurePost: featurePostMutation.mutateAsync,
    restorePost: restorePostMutation.mutateAsync,
    bulkDeletePosts: bulkDeleteMutation.mutateAsync,
    isDeleting: deletePostMutation.isPending || deleteCommentMutation.isPending,
    isFeaturing: featurePostMutation.isPending,
    isRestoring: restorePostMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
  };
};

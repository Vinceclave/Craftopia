import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moderationAPI } from '../lib/api';
import { useState } from 'react';

export const usePosts = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['content-review', page, limit],
    queryFn: () => moderationAPI.getContentForReview(page, limit),
  });

  const deletePostMutation = useMutation({
    mutationFn: ({ postId, reason }: { postId: number; reason?: string }) =>
      moderationAPI.deletePost(postId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-review'] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: ({ commentId, reason }: { commentId: number; reason?: string }) =>
      moderationAPI.deleteComment(commentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-review'] });
    },
  });

  const featurePostMutation = useMutation({
    mutationFn: moderationAPI.featurePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-review'] });
    },
  });

  const restorePostMutation = useMutation({
    mutationFn: moderationAPI.restorePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-review'] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: ({ postIds, reason }: { postIds: number[]; reason?: string }) =>
      moderationAPI.bulkDeletePosts(postIds, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-review'] });
    },
  });

  return {
    posts: data?.data?.posts || [],
    comments: data?.data?.comments || [],
    meta: data?.data?.meta,
    isLoading,
    error,
    page,
    setPage,
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moderationAPI} from '../lib/api';
import { useState } from 'react';

export const usePosts = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['content-review', page, limit],
    queryFn: async () => {
      console.log('🔍 Fetching content for review, page:', page);
      const response = await moderationAPI.getContentForReview(page, limit);
      console.log('✅ Content response:', response);
      return response;
    },
    retry: 1,
  });

  const deletePostMutation = useMutation({
    mutationFn: async ({ postId, reason }: { postId: number; reason?: string }) => {
      console.log('🗑️ Deleting post:', { postId, reason });
      return await moderationAPI.deletePost(postId, reason);
    },
    onSuccess: (data) => {
      console.log('✅ Post deleted:', data);
      queryClient.invalidateQueries({ queryKey: ['content-review'] });
    },
    onError: (error: any) => {
      console.error('❌ Delete post error:', error);
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async ({ commentId, reason }: { commentId: number; reason?: string }) => {
      console.log('🗑️ Deleting comment:', { commentId, reason });
      return await moderationAPI.deleteComment(commentId, reason);
    },
    onSuccess: (data) => {
      console.log('✅ Comment deleted:', data);
      queryClient.invalidateQueries({ queryKey: ['content-review'] });
    },
    onError: (error: any) => {
      console.error('❌ Delete comment error:', error);
    }
  });

  const featurePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      console.log('⭐ Featuring post:', postId);
      return await moderationAPI.featurePost(postId);
    },
    onSuccess: (data) => {
      console.log('✅ Post featured:', data);
      queryClient.invalidateQueries({ queryKey: ['content-review'] });
    },
    onError: (error: any) => {
      console.error('❌ Feature post error:', error);
    }
  });

  const restorePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      console.log('♻️ Restoring post:', postId);
      return await moderationAPI.restorePost(postId);
    },
    onSuccess: (data) => {
      console.log('✅ Post restored:', data);
      queryClient.invalidateQueries({ queryKey: ['content-review'] });
    },
    onError: (error: any) => {
      console.error('❌ Restore post error:', error);
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async ({ postIds, reason }: { postIds: number[]; reason?: string }) => {
      console.log('🗑️ Bulk deleting posts:', { postIds, reason });
      return await moderationAPI.bulkDeletePosts(postIds, reason);
    },
    onSuccess: (data) => {
      console.log('✅ Posts bulk deleted:', data);
      queryClient.invalidateQueries({ queryKey: ['content-review'] });
    },
    onError: (error: any) => {
      console.error('❌ Bulk delete error:', error);
    }
  });

  return {
    posts: data?.data?.posts || [],
    comments: data?.data?.comments || [],
    meta: data?.data?.meta,
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
// apps/web/src/hooks/usePosts.ts - COMPLETE FIXED VERSION

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moderationAPI } from '../lib/api';
import { useState } from 'react';

export const usePosts = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['content-review', page, limit],
    queryFn: async () => {
      console.log('🔍 Frontend: Fetching content, page:', page, 'limit:', limit);
      
      const response = await moderationAPI.getContentForReview(page, limit);
      
      console.log('📦 Frontend: Raw API response:', response);
      
      // ✅ FIX: Extract data properly from nested response structure
      // Handle both formats: { data: { posts, comments, meta } } and { success: true, data: {...} }
      let posts, comments, meta;
      
      if (response.data) {
        if (response.data.posts) {
          // Format 1: { data: { posts, comments, meta } }
          posts = response.data.posts;
          comments = response.data.comments;
          meta = response.data.meta;
        } else if (Array.isArray(response.data)) {
          // Format 2: { data: [...] } (unlikely but handle it)
          posts = response.data;
          comments = [];
          meta = {};
        }
      } else {
        // Format 3: Direct structure
        posts = response.posts || [];
        comments = response.comments || [];
        meta = response.meta || {};
      }
      
      console.log('✅ Frontend: Extracted data:', { 
        postsCount: posts?.length || 0, 
        commentsCount: comments?.length || 0,
        meta 
      });
      
      return { 
        posts: posts || [], 
        comments: comments || [], 
        meta: meta || {} 
      };
    },
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });

  const deletePostMutation = useMutation({
    mutationFn: async ({ postId, reason }: { postId: number; reason?: string }) => {
      console.log('🗑️ Frontend: Deleting post:', { postId, reason });
      return await moderationAPI.deletePost(postId, reason);
    },
    onSuccess: (data) => {
      console.log('✅ Frontend: Post deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['content-review'] });
    },
    onError: (error: any) => {
      console.error('❌ Frontend: Delete post error:', error);
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async ({ commentId, reason }: { commentId: number; reason?: string }) => {
      console.log('🗑️ Frontend: Deleting comment:', { commentId, reason });
      return await moderationAPI.deleteComment(commentId, reason);
    },
    onSuccess: (data) => {
      console.log('✅ Frontend: Comment deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['content-review'] });
    },
    onError: (error: any) => {
      console.error('❌ Frontend: Delete comment error:', error);
    }
  });

  const featurePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      console.log('⭐ Frontend: Toggling post feature:', postId);
      return await moderationAPI.featurePost(postId);
    },
    onSuccess: (data) => {
      console.log('✅ Frontend: Post feature status toggled');
      queryClient.invalidateQueries({ queryKey: ['content-review'] });
    },
    onError: (error: any) => {
      console.error('❌ Frontend: Feature post error:', error);
    }
  });

  const restorePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      console.log('♻️ Frontend: Restoring post:', postId);
      return await moderationAPI.restorePost(postId);
    },
    onSuccess: (data) => {
      console.log('✅ Frontend: Post restored successfully');
      queryClient.invalidateQueries({ queryKey: ['content-review'] });
    },
    onError: (error: any) => {
      console.error('❌ Frontend: Restore post error:', error);
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async ({ postIds, reason }: { postIds: number[]; reason?: string }) => {
      console.log('🗑️ Frontend: Bulk deleting posts:', { count: postIds.length, reason });
      return await moderationAPI.bulkDeletePosts(postIds, reason);
    },
    onSuccess: (data) => {
      console.log('✅ Frontend: Posts bulk deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['content-review'] });
    },
    onError: (error: any) => {
      console.error('❌ Frontend: Bulk delete error:', error);
    }
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
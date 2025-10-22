import React, { useState, useCallback } from 'react';
import { Post } from './Post';
import { CommentModal } from './comment/CommentModal';
import { useComments, useAddComment } from '~/hooks/queries/usePosts';

interface PostContainerProps {
  postId: number;
  user_id: number;
  title: string;
  content: string;
  image_url?: string | null;
  category: string;
  tags?: string[];
  featured?: boolean;
  commentCount: number;
  likeCount: number;
  isLiked?: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  user?: {
    user_id: number;
    username: string;
  };
  onToggleReaction?: () => void;
}

export const PostContainer: React.FC<PostContainerProps> = ({
  postId,
  user_id,
  title,
  content,
  image_url,
  category,
  tags = [],
  featured = false,
  commentCount = 0,
  likeCount = 0,
  isLiked = false,
  created_at,
  updated_at,
  deleted_at,
  user,
  onToggleReaction
}) => {
  const [showCommentModal, setShowCommentModal] = useState(false);

  // TanStack Query hooks for comments
  const { 
    data: comments = [], 
    isLoading: loadingComments, 
    refetch: refetchComments 
  } = useComments(postId);

  const addCommentMutation = useAddComment();

  const handleOpenComments = useCallback(() => {
    setShowCommentModal(true);
  }, []);

  const handleAddComment = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      
      try {
        await addCommentMutation.mutateAsync({ postId, content });
      } catch (error) {
        console.error('Failed to add comment:', error);
      }
    },
    [addCommentMutation, postId]
  );

  const handleCloseModal = useCallback(() => {
    setShowCommentModal(false);
  }, []);

  // Don't render if essential data is missing
  if (!postId || !title) {
    console.warn('PostContainer: Missing essential post data');
    return null;
  }

  return (
    <>
      <Post 
        post_id={postId}
        user_id={user_id}
        title={title}
        content={content}
        image_url={image_url}
        category={category}
        tags={tags}
        featured={featured}
        commentCount={commentCount}
        likeCount={likeCount}
        isLiked={isLiked}
        created_at={created_at}
        updated_at={updated_at}
        deleted_at={deleted_at}
        user={user}
        onToggleReaction={onToggleReaction}
        onOpenComments={handleOpenComments}
      />
      <CommentModal
        visible={showCommentModal}
        onClose={handleCloseModal}
        postTitle={title}
        comments={comments}
        onAddComment={handleAddComment}
        loading={loadingComments}
        submitting={addCommentMutation.isPending}
      />
    </>
  );
};
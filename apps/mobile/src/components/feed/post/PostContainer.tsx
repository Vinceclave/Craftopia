import React, { useState, useCallback, useEffect } from 'react'
import { Post } from './Post'
import { CommentModal } from './comment/CommentModal'
import type { Comment } from './type'

interface PostContainerProps extends React.ComponentProps<typeof Post> {
  postId: number
  onLoadComments?: (postId: number) => Promise<Comment[]>
  onAddComment?: (postId: number, content: string) => Promise<void>
  onToggleCommentReaction?: (commentId: number) => Promise<void>
}

export const PostContainer: React.FC<PostContainerProps> = ({
  postId,
  onLoadComments,
  onAddComment,
  onToggleCommentReaction,
  ...postProps
}) => {
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)

  // Debug state changes
  useEffect(() => {
    console.log('PostContainer showCommentModal state:', showCommentModal);
  }, [showCommentModal]);

  const handleOpenComments = useCallback(async () => {
    console.log('handleOpenComments called for postId:', postId);
    
    setShowCommentModal(true);
    console.log('Set showCommentModal to true');
    
    if (onLoadComments) {
      console.log('Loading comments...');
      setLoadingComments(true);
      try {
        const fetched = await onLoadComments(postId);
        console.log('Comments loaded:', fetched.length);
        setComments(fetched);
      } catch (error) {
        console.error('Error loading comments:', error);
      } finally {
        setLoadingComments(false);
      }
    } else {
      console.log('onLoadComments not provided, using empty comments');
      setComments([]);
    }
  }, [onLoadComments, postId]);

  const handleAddComment = useCallback(
    async (content: string) => {
      if (!onAddComment) {
        console.log('onAddComment not provided');
        return;
      }
      
      console.log('Adding comment:', content);
      await onAddComment(postId, content);
      
      // Reload comments after adding
      if (onLoadComments) {
        try {
          const updated = await onLoadComments(postId);
          setComments(updated);
        } catch (error) {
          console.error('Error reloading comments:', error);
        }
      }
    },
    [onAddComment, onLoadComments, postId]
  );

  const handleToggleCommentReaction = useCallback(
    async (commentId: number) => {
      if (!onToggleCommentReaction) {
        console.log('onToggleCommentReaction not provided');
        return;
      }
      
      console.log('Toggling comment reaction for:', commentId);
      
      try {
        await onToggleCommentReaction(commentId);
        
        // Update local state optimistically
        setComments(prev =>
          prev.map(c =>
            c.comment_id === commentId
              ? { 
                  ...c, 
                  isLiked: !c.isLiked, 
                  likeCount: c.isLiked ? c.likeCount - 1 : c.likeCount + 1 
                }
              : c
          )
        );
      } catch (error) {
        console.error('Error toggling comment reaction:', error);
      }
    },
    [onToggleCommentReaction]
  );

  const handleCloseModal = useCallback(() => {
    console.log('Closing comment modal');
    setShowCommentModal(false);
  }, []);

  return (
    <>
      <Post {...postProps} onOpenComments={handleOpenComments} />
      <CommentModal
        visible={showCommentModal}
        onClose={handleCloseModal}
        postTitle={postProps.title}
        comments={comments}
        onAddComment={handleAddComment}
        onToggleCommentReaction={handleToggleCommentReaction}
        loading={loadingComments}
      />
    </>
  )
}


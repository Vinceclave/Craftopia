// apps/mobile/src/components/feed/post/PostContainer.tsx - CRAFTOPIA REFINED
import React, { useState, useCallback } from 'react';
import { Post } from './Post';
import { CommentModal } from './comment/CommentModal';
import { ReportModal, ReportReason } from '../ReportModal';
import { EditPostModal } from '../EditPostModal';
import { ActionSheet, useActionSheet } from '~/components/common/ActionSheet';
import { useComments, useAddComment, useDeletePost, useUpdatePost, useTogglePostReaction } from '~/hooks/queries/usePosts';
import { useSubmitReport } from '~/hooks/queries/useReports';
import { useAuth } from '~/context/AuthContext';
import { useAlert } from '~/hooks/useAlert';
import { PostDetailsModal } from './PostDetailsModal';

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
  const { user: currentUser } = useAuth();
  const { success, error: showError } = useAlert();
  const actionSheet = useActionSheet();

  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const submitReportMutation = useSubmitReport();
  const deletePostMutation = useDeletePost();
  const updatePostMutation = useUpdatePost();
  const addCommentMutation = useAddComment();
  const toggleReactionMutation = useTogglePostReaction();

  const currentUserId = currentUser?.id;
  const isOwnPost = currentUserId !== undefined && 
                    currentUserId !== null && 
                    Number(currentUserId) === Number(user_id);

  // Get comments with error handling for deleted posts
  // Get comments with error handling for deleted posts
  const { data: comments = [], isLoading: loadingComments, error: commentsError } = useComments(postId, {
    enabled: !isDeleted,
    retry: false,
  });

  // Handle comment fetch errors (e.g., deleted posts)
  React.useEffect(() => {
    if (commentsError) {
      const errorMessage = (commentsError as any)?.message || '';
      if (errorMessage.includes('Post not found') || errorMessage.includes('not found')) {
        console.log('Post was deleted, ignoring fetch error');
        setIsDeleted(true);
      }
    }
  }, [commentsError]);
  const handlePostPress = () => {
    if (isDeleted) return;
    setShowDetailsModal(true);
  };


  const handleDeletePost = () => {
    setShowDeleteConfirm(false);
    
    setTimeout(async () => {
      try {
        await deletePostMutation.mutateAsync(postId);
        setIsDeleted(true);
        success('Post Deleted', 'Your post has been deleted successfully.');
      } catch (error: any) {
        showError('Delete Failed', error.message || 'Failed to delete post');
      }
    }, 100);
  };

  const showDeleteConfirmation = () => {
    setShowDeleteConfirm(true);
  };

  const handleEdit = () => {
    if (isDeleted) return;
    setShowEditModal(true);
  };

  const handleOptions = () => {
    if (isDeleted) return;
    
    if (isOwnPost) {
      actionSheet.show(
        'Post Options',
        'What would you like to do with your post?',
        [
          {
            text: 'Edit Post',
            onPress: handleEdit,
            style: 'default',
          },
          {
            text: 'Delete Post',
            onPress: showDeleteConfirmation,
            style: 'destructive',
          },
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
        ]
      );
    } else {
      setShowReportModal(true);
    }
  };

  const handleEditPost = async (updatedData: { title: string; content: string; tags?: string[] }) => {
    if (isDeleted) return;
    
    try {
      await updatePostMutation.mutateAsync({
        postId,
        ...updatedData,
      });

      setShowEditModal(false);
      success('Post Updated', 'Your post has been updated successfully.');
    } catch (error: any) {
      showError('Update Failed', error.message || 'Failed to update post');
    }
  };

  const handleReport = async (reason: ReportReason, details: string) => {
    if (isDeleted) return;
    
    try {
      await submitReportMutation.mutateAsync({
        type: 'post',
        targetId: postId,
        reason,
        details,
      });

      setShowReportModal(false);
      success(
        'Report Submitted',
        'Thank you for helping keep our community safe.'
      );
    } catch (error: any) {
      showError(
        'Report Failed',
        error.message || 'Failed to submit report. Please try again.'
      );
    }
  };

  const handleOpenComments = useCallback(() => {
    if (isDeleted) return;
    setShowCommentModal(true);
  }, [isDeleted]);

  const handleCloseComments = useCallback(() => {
    setShowCommentModal(false);
  }, []);

  const handleAddComment = useCallback(
    async (content: string) => {
      if (!content.trim() || isDeleted) return;
      try {
        await addCommentMutation.mutateAsync({ postId, content });
      } catch (error) {
        showError('Comment Failed', 'Failed to add comment. Please try again.');
      }
    },
    [addCommentMutation, postId, isDeleted]
  );

  const handleToggleReactionInDetails = async () => {
    if (isDeleted) return;
    
    try {
      await toggleReactionMutation.mutateAsync(postId);
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  };

  // Don't render if deleted
  if (!postId || !title || isDeleted) {
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
        onOptionsPress={handleOptions}
        onPress={handlePostPress}
      />

      <ActionSheet
        visible={actionSheet.visible}
        title={actionSheet.config.title}
        message={actionSheet.config.message}
        options={actionSheet.config.options}
        onClose={actionSheet.hide}
      />

      <ActionSheet
        visible={showDeleteConfirm}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        options={[
          {
            text: 'Delete',
            onPress: handleDeletePost,
            style: 'destructive',
          },
          {
            text: 'Cancel',
            onPress: () => setShowDeleteConfirm(false),
            style: 'cancel',
          },
        ]}
        onClose={() => setShowDeleteConfirm(false)}
      />

      {!isDeleted && (
        <>
          <CommentModal
            visible={showCommentModal}
            onClose={handleCloseComments}
            postTitle={title}
            comments={comments}
            onAddComment={handleAddComment}
            loading={loadingComments}
            submitting={addCommentMutation.isPending}
          />

          <PostDetailsModal
            visible={showDetailsModal}
            postId={postId}
            onClose={() => setShowDetailsModal(false)}
            onToggleReaction={handleToggleReactionInDetails}
          />

          {isOwnPost && (
            <EditPostModal
              visible={showEditModal}
              onClose={() => setShowEditModal(false)}
              onSubmit={handleEditPost}
              initialData={{
                title,
                content,
                tags,
              }}
              loading={updatePostMutation.isPending}
            />
          )}

          <ReportModal
            visible={showReportModal}
            onClose={() => setShowReportModal(false)}
            onSubmit={handleReport}
            contentType="post"
            contentId={postId}
            loading={submitReportMutation.isPending}
          />
        </>
      )}
    </>
  );
};
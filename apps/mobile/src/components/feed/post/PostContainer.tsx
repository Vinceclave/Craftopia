// apps/mobile/src/components/feed/post/PostContainer.tsx - FIXED WITH ACTIONSHEET
import React, { useState, useCallback } from 'react';
import { Share, Platform } from 'react-native';

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

  const submitReportMutation = useSubmitReport();
  const deletePostMutation = useDeletePost();
  const updatePostMutation = useUpdatePost();
  const addCommentMutation = useAddComment();
  const toggleReactionMutation = useTogglePostReaction();

  // Extract user ID from multiple possible properties
  const currentUserId = 
    currentUser?.id || 
    currentUser?.user_id || 
    currentUser?.userId || 
    currentUser?.sub ||
    currentUser?.uid;

  // Calculate if this is user's own post
  const isOwnPost = currentUserId !== undefined && 
                    currentUserId !== null && 
                    Number(currentUserId) === Number(user_id);

  console.log('🔍 IS OWN POST RESULT:', {
    isOwnPost,
    comparison: `${currentUserId} === ${user_id}`,
    afterConversion: `${Number(currentUserId)} === ${Number(user_id)}`,
  });

  // TanStack Query for comments
  const { data: comments = [], isLoading: loadingComments } = useComments(postId);

  // === POST CLICK HANDLER ===
  const handlePostPress = () => {
    console.log('📄 Post clicked, opening details:', postId);
    setShowDetailsModal(true);
  };

  // === SHARE HANDLER ===
  const handleShare = async () => {
    try {
      console.log('🔗 Sharing post:', postId);
      
      const shareContent = {
        title: `${title} - Craftopia`,
        message: `Check out this post on Craftopia!\n\n${title}\n\n${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
        url: `craftopia://post/${postId}`,
      };

      const result = await Share.share(
        Platform.OS === 'ios' 
          ? {
              title: shareContent.title,
              message: shareContent.message,
              url: shareContent.url,
            }
          : {
              title: shareContent.title,
              message: `${shareContent.message}\n\n${shareContent.url}`,
            }
      );

      if (result.action === Share.sharedAction) {
        console.log('✅ Post shared successfully');
      }
    } catch (error: any) {
      console.error('❌ Error sharing:', error);
      showError('Share Failed', 'Failed to share post. Please try again.');
    }
  };

  // === DELETE HANDLER ===
  const handleDeletePost = () => {
    console.log('🗑️ Delete confirmed, proceeding...');
    setShowDeleteConfirm(false);
    
    setTimeout(async () => {
      try {
        console.log('🗑️ Deleting post:', postId);
        await deletePostMutation.mutateAsync(postId);
        success('Post Deleted', 'Your post has been deleted successfully.');
      } catch (error: any) {
        console.error('❌ Delete failed:', error);
        showError('Delete Failed', error.message || 'Failed to delete post');
      }
    }, 100);
  };

  // === DELETE CONFIRMATION ===
  const showDeleteConfirmation = () => {
    console.log('🗑️ Showing delete confirmation');
    setShowDeleteConfirm(true);
  };

  // === EDIT HANDLER ===
  const handleEdit = () => {
    console.log('✏️ Edit button pressed');
    setShowEditModal(true);
  };

  // === OPTIONS HANDLER - USING ACTIONSHEET ===
  const handleOptions = () => {
    console.log('🔧 OPTIONS BUTTON CLICKED!');
    console.log('🔧 isOwnPost:', isOwnPost);
    console.log('🔧 currentUserId:', currentUserId);
    console.log('🔧 postUserId:', user_id);
    
    if (isOwnPost) {
      console.log('✅ SHOWING EDIT/DELETE ALERT FOR YOUR POST');
      
      // Show ActionSheet instead of Alert
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
            text: 'Share Post',
            onPress: handleShare,
            style: 'default',
          },
          {
            text: 'Delete Post',
            onPress: showDeleteConfirmation,
            style: 'destructive',
          },
          {
            text: 'Cancel',
            onPress: () => console.log('Cancelled'),
            style: 'cancel',
          },
        ]
      );
    } else {
      console.log('✅ OPENING REPORT MODAL FOR OTHER USER\'S POST');
      setShowReportModal(true);
    }
  };

  // === EDIT POST HANDLER ===
  const handleEditPost = async (updatedData: { title: string; content: string; tags?: string[] }) => {
    try {
      console.log('✏️ Updating post:', postId, updatedData);
      
      await updatePostMutation.mutateAsync({
        postId,
        ...updatedData,
      });

      console.log('✅ Post updated successfully');
      setShowEditModal(false);
      
      success('Post Updated', 'Your post has been updated successfully.');
    } catch (error: any) {
      console.error('❌ Update failed:', error);
      showError('Update Failed', error.message || 'Failed to update post');
    }
  };

  // === REPORT HANDLER ===
  const handleReport = async (reason: ReportReason, details: string) => {
    try {
      console.log('📢 Submitting report:', { postId, reason, details });
      
      await submitReportMutation.mutateAsync({
        type: 'post',
        targetId: postId,
        reason,
        details,
      });

      console.log('✅ Report submitted successfully');
      setShowReportModal(false);
      
      success(
        'Report Submitted',
        'Thank you for helping keep our community safe. We\'ll review this report shortly.'
      );
    } catch (error: any) {
      console.error('❌ Report submission failed:', error);
      showError(
        'Report Failed',
        error.message || 'Failed to submit report. Please try again.'
      );
    }
  };

  // === COMMENT HANDLERS ===
  const handleOpenComments = useCallback(() => {
    console.log('💬 Opening comments for post:', postId);
    setShowCommentModal(true);
  }, [postId]);

  const handleCloseComments = useCallback(() => {
    console.log('💬 Closing comments modal');
    setShowCommentModal(false);
  }, []);

  const handleAddComment = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      try {
        console.log('💬 Adding comment to post:', postId);
        await addCommentMutation.mutateAsync({ postId, content });
        console.log('✅ Comment added successfully');
      } catch (error) {
        console.error('❌ Failed to add comment:', error);
        showError('Comment Failed', 'Failed to add comment. Please try again.');
      }
    },
    [addCommentMutation, postId]
  );

  // === TOGGLE REACTION HANDLER FOR DETAILS MODAL ===
  const handleToggleReactionInDetails = async () => {
    try {
      await toggleReactionMutation.mutateAsync(postId);
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  };

  // Validation
  if (!postId || !title) {
    console.warn('⚠️ PostContainer: Missing essential post data');
    return null;
  }

  // === RENDER ===
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
        onShare={handleShare}
        onPress={handlePostPress}
      />

      {/* ActionSheet for Options */}
      <ActionSheet
        visible={actionSheet.visible}
        title={actionSheet.config.title}
        message={actionSheet.config.message}
        options={actionSheet.config.options}
        onClose={actionSheet.hide}
      />

      {/* Delete Confirmation ActionSheet */}
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

      {/* Comment Modal */}
      <CommentModal
        visible={showCommentModal}
        onClose={handleCloseComments}
        postTitle={title}
        comments={comments}
        onAddComment={handleAddComment}
        loading={loadingComments}
        submitting={addCommentMutation.isPending}
      />

      {/* Post Details Modal */}
      <PostDetailsModal
        visible={showDetailsModal}
        postId={postId}
        onClose={() => setShowDetailsModal(false)}
        onToggleReaction={handleToggleReactionInDetails}
        onShare={handleShare}
      />

      {/* Edit Modal - Only for own posts */}
      {isOwnPost && (
        <EditPostModal
          visible={showEditModal}
          onClose={() => {
            console.log('✏️ Closing edit modal');
            setShowEditModal(false);
          }}
          onSubmit={handleEditPost}
          initialData={{
            title,
            content,
            tags,
          }}
          loading={updatePostMutation.isPending}
        />
      )}

      {/* Report Modal - For other's posts */}
      <ReportModal
        visible={showReportModal}
        onClose={() => {
          console.log('📢 Closing report modal');
          setShowReportModal(false);
        }}
        onSubmit={handleReport}
        contentType="post"
        contentId={postId}
        loading={submitReportMutation.isPending}
      />
    </>
  );
};
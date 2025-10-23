// apps/mobile/src/components/feed/post/PostContainer.tsx
// FIXED VERSION - Edit/Delete Alert WILL SHOW
import React, { useState, useCallback } from 'react';
import { Alert, Share, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Post } from './Post';
import { CommentModal } from './comment/CommentModal';
import { ReportModal, ReportReason } from '../ReportModal';
import { EditPostModal } from '../EditPostModal';
import { useComments, useAddComment, useDeletePost, useUpdatePost } from '~/hooks/queries/usePosts';
import { useSubmitReport } from '~/hooks/queries/useReports';
import { useAuth } from '~/context/AuthContext';
import { FeedStackParamList } from '~/navigations/types';

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
  const navigation = useNavigation<NativeStackNavigationProp<FeedStackParamList>>();
  const { user: currentUser } = useAuth();

  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const submitReportMutation = useSubmitReport();
  const deletePostMutation = useDeletePost();
  const updatePostMutation = useUpdatePost();
  const addCommentMutation = useAddComment();

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
      Alert.alert('Error', 'Failed to share post. Please try again.');
    }
  };

  // === DELETE HANDLER ===
  const handleDeletePost = () => {
    console.log('🗑️ Delete button pressed');
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              console.log('🗑️ Deleting post:', postId);
              await deletePostMutation.mutateAsync(postId);
              Alert.alert('Success', 'Post deleted successfully');
            } catch (error: any) {
              console.error('❌ Delete failed:', error);
              Alert.alert('Error', error.message || 'Failed to delete post');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  // === EDIT HANDLER ===
  const handleEdit = () => {
    console.log('✏️ Edit button pressed');
    setShowEditModal(true);
  };

  // === OPTIONS HANDLER - GUARANTEED TO WORK ===
  const handleOptions = () => {
    console.log('🔧 OPTIONS BUTTON CLICKED!');
    console.log('🔧 isOwnPost:', isOwnPost);
    console.log('🔧 currentUserId:', currentUserId);
    console.log('🔧 postUserId:', user_id);
    
    if (isOwnPost) {
      // THIS IS YOUR OWN POST - SHOW EDIT/DELETE
      console.log('✅ SHOWING EDIT/DELETE ALERT FOR YOUR POST');
      
      // Use setTimeout to ensure Alert shows properly
      setTimeout(() => {
        Alert.alert(
          'Post Options',
          'What would you like to do with your post?',
          [
            { 
              text: 'Edit Post', 
              onPress: handleEdit
            },
            { 
              text: 'Share Post', 
              onPress: handleShare 
            },
            { 
              text: 'Delete Post', 
              onPress: handleDeletePost, 
              style: 'destructive' 
            },
            { 
              text: 'Cancel', 
              style: 'cancel' 
            },
          ],
          { cancelable: true }
        );
      }, 100);
    } else {
      // THIS IS SOMEONE ELSE'S POST - SHOW REPORT
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
      
      Alert.alert('Success', 'Post updated successfully');
    } catch (error: any) {
      console.error('❌ Update failed:', error);
      Alert.alert('Error', error.message || 'Failed to update post');
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
      
      Alert.alert(
        'Report Submitted',
        'Thank you for helping keep our community safe. We\'ll review this report shortly.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('❌ Report submission failed:', error);
      Alert.alert(
        'Error', 
        error.message || 'Failed to submit report. Please try again.', 
        [{ text: 'OK' }]
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
        Alert.alert('Error', 'Failed to add comment. Please try again.');
      }
    },
    [addCommentMutation, postId]
  );

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
import React, { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Post } from './Post';
import { CommentModal } from './comment/CommentModal';
import { ReportModal, ReportReason } from '../ReportModal';
import { useComments, useAddComment, useDeletePost } from '~/hooks/queries/usePosts';
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

  const submitReportMutation = useSubmitReport();
  const deletePostMutation = useDeletePost();
  const addCommentMutation = useAddComment();

  const isOwnPost = currentUser?.id === user_id;

  // TanStack Query for comments
  const { data: comments = [], isLoading: loadingComments } = useComments(postId);

  // === Handlers ===

  const handleOptions = () => {
    if (isOwnPost) {
      Alert.alert(
        'Post Options',
        'What would you like to do?',
        [
          { text: 'Edit', onPress: () => console.log('Edit post') },
          { text: 'Delete', onPress: handleDeletePost, style: 'destructive' },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      setShowReportModal(true); // Directly open report modal
    }
  };

  const handleDeletePost = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deletePostMutation.mutateAsync(postId);
              Alert.alert('Success', 'Post deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete post');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleReport = async (reason: ReportReason, details: string) => {
    try {
      await submitReportMutation.mutateAsync({
        type: 'post',
        targetId: postId,
        reason,
        details,
      });

      Alert.alert(
        'Report Submitted',
        'Thank you for helping keep our community safe. We\'ll review this report shortly.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit report. Please try again.', [{ text: 'OK' }]);
    }
  };

  const handleOpenComments = useCallback(() => setShowCommentModal(true), []);
  const handleCloseComments = useCallback(() => setShowCommentModal(false), []);

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

  if (!postId || !title) {
    console.warn('PostContainer: Missing essential post data');
    return null;
  }

  // === Render ===
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
        onOptionsPress={handleOptions} // Triggers delete/report
      />

      <CommentModal
        visible={showCommentModal}
        onClose={handleCloseComments}
        postTitle={title}
        comments={comments}
        onAddComment={handleAddComment}
        loading={loadingComments}
        submitting={addCommentMutation.isPending}
      />

      <ReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReport}
        contentType="post"
        contentId={postId}
        loading={submitReportMutation.isPending}
      />
    </>
  );
};

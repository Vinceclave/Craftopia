// apps/mobile/src/components/feed/PostDetailsModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Heart, MessageCircle, Share2, Clock, Edit } from 'lucide-react-native';
import { usePost, useComments, useAddComment } from '~/hooks/queries/usePosts';
import { formatTimeAgo } from '~/utils/time';
import { CommentItem } from './comment/CommentItem';
import { CommentInput } from './comment/CommentInput';

interface PostDetailsModalProps {
  visible: boolean;
  postId: number;
  onClose: () => void;
  onToggleReaction?: () => void;
  onShare?: () => void;
}

export const PostDetailsModal: React.FC<PostDetailsModalProps> = ({
  visible,
  postId,
  onClose,
  onToggleReaction,
  onShare,
}) => {
  const { 
    data: post, 
    isLoading: postLoading, 
    error: postError, 
    refetch: refetchPost 
  } = usePost(postId);

  const { 
    data: comments = [], 
    isLoading: commentsLoading, 
    refetch: refetchComments 
  } = useComments(postId);

  const addCommentMutation = useAddComment();

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchPost(), refetchComments()]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddComment = async (content: string) => {
    if (!content.trim()) return;
    try {
      await addCommentMutation.mutateAsync({ postId, content });
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-light">
        {/* Header */}
        <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light flex-row items-center justify-between">
          <Text className="text-base font-semibold text-craftopia-textPrimary flex-1" numberOfLines={1}>
            Post Details
          </Text>
          <TouchableOpacity onPress={onClose} className="p-1">
            <X size={22} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        {postLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#374A36" />
            <Text className="text-craftopia-textSecondary mt-2">Loading post...</Text>
          </View>
        ) : postError || !post ? (
          <View className="flex-1 justify-center items-center px-6">
            <Text className="text-craftopia-textPrimary text-lg font-semibold mb-2">
              Post Not Found
            </Text>
            <Text className="text-craftopia-textSecondary text-center mb-4">
              This post may have been deleted or doesn't exist.
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="bg-craftopia-primary px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-medium">Close</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={['#374A36']}
                  tintColor="#374A36"
                />
              }
            >
              {/* Post Content */}
              <View className="bg-craftopia-surface p-4 border-b border-craftopia-light">
                {/* Author */}
                <View className="flex-row items-center mb-3">
                  <Image
                    source={{ uri: `https://i.pravatar.cc/40?u=${post.user_id}` }}
                    className="w-10 h-10 rounded-full"
                  />
                  <View className="flex-1 ml-3">
                    <Text className="font-medium text-craftopia-textPrimary">
                      {post.user?.username || 'Unknown User'}
                    </Text>
                    <View className="flex-row items-center">
                      <Clock size={12} color="#9CA3AF" />
                      <Text className="text-xs text-craftopia-textSecondary ml-1">
                        {formatTimeAgo(post.created_at)}
                      </Text>
                      {post.updated_at !== post.created_at && (
                        <>
                          <Text className="text-xs text-craftopia-textSecondary mx-1">•</Text>
                          <Edit size={12} color="#9CA3AF" />
                          <Text className="text-xs text-craftopia-textSecondary ml-1">Edited</Text>
                        </>
                      )}
                    </View>
                  </View>
                  {post.featured && (
                    <View className="bg-craftopia-accent/20 rounded-full px-3 py-1">
                      <Text className="text-xs font-medium text-craftopia-accent">
                        Featured
                      </Text>
                    </View>
                  )}
                </View>

                {/* Title */}
                <Text className="text-xl font-bold text-craftopia-textPrimary mb-2">
                  {post.title}
                </Text>

                {/* Content */}
                <Text className="text-craftopia-textSecondary text-base leading-6 mb-3">
                  {post.content}
                </Text>

                {/* Image */}
                {post.image_url && (
                  <Image
                    source={{ uri: post.image_url }}
                    className="w-full h-64 rounded-lg mb-3"
                    resizeMode="cover"
                  />
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <View className="flex-row flex-wrap mb-3">
                    {post.tags.map((tag, idx) => (
                      <View
                        key={`${tag}-${idx}`}
                        className="bg-craftopia-light rounded-full px-3 py-1 mr-2 mb-2"
                      >
                        <Text className="text-sm text-craftopia-primary">#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Actions */}
                <View className="flex-row items-center justify-between pt-3 border-t border-craftopia-light">
                  <View className="flex-row items-center gap-6">
                    {/* Like */}
                    <TouchableOpacity
                      className="flex-row items-center"
                      onPress={onToggleReaction}
                      activeOpacity={0.7}
                    >
                      <Heart
                        size={22}
                        color={post.isLiked ? '#D4A96A' : '#5D6B5D'}
                        fill={post.isLiked ? '#D4A96A' : 'transparent'}
                      />
                      <Text className="ml-2 text-base text-craftopia-textSecondary">
                        {post.likeCount}
                      </Text>
                    </TouchableOpacity>

                    {/* Comments */}
                    <View className="flex-row items-center">
                      <MessageCircle size={22} color="#5D6B5D" />
                      <Text className="ml-2 text-base text-craftopia-textSecondary">
                        {post.commentCount}
                      </Text>
                    </View>
                  </View>

                  {/* Share */}
                  {onShare && (
                    <TouchableOpacity
                      className="flex-row items-center"
                      onPress={onShare}
                      activeOpacity={0.7}
                    >
                      <Share2 size={20} color="#5D6B5D" />
                      <Text className="ml-2 text-sm text-craftopia-textSecondary">Share</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Comments Section */}
              <View className="bg-craftopia-surface mt-2 p-4">
                <Text className="text-base font-semibold text-craftopia-textPrimary mb-3">
                  Comments ({comments.length})
                </Text>

                {commentsLoading ? (
                  <View className="py-8 items-center">
                    <ActivityIndicator size="small" color="#374A36" />
                    <Text className="text-craftopia-textSecondary text-sm mt-2">
                      Loading comments...
                    </Text>
                  </View>
                ) : comments.length === 0 ? (
                  <View className="py-8 items-center">
                    <MessageCircle size={32} color="#D1D5DB" />
                    <Text className="text-craftopia-textSecondary text-center mt-2">
                      No comments yet. Be the first to comment!
                    </Text>
                  </View>
                ) : (
                  <View>
                    {comments.map((comment) => (
                      <CommentItem key={comment.comment_id} comment={comment} />
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Comment Input */}
            <View className="bg-craftopia-surface border-t border-craftopia-light">
              <CommentInput
                onSend={handleAddComment}
                submitting={addCommentMutation.isPending}
              />
            </View>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
};
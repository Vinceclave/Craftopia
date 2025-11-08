// apps/mobile/src/components/feed/PostDetailsModal.tsx - REDESIGNED
import React, { useState } from 'react';
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
import { X, Heart, MessageCircle, Share2, Clock, Edit, User } from 'lucide-react-native';
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

  const [refreshing, setRefreshing] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

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

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
        {/* Header */}
        <View className="px-5 py-4 border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">Post Details</Text>
            <TouchableOpacity 
              onPress={onClose}
              className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
            >
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {postLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#6B7280" />
            <Text className="text-gray-500 mt-3">Loading post...</Text>
          </View>
        ) : postError || !post ? (
          <View className="flex-1 justify-center items-center px-6">
            <View className="items-center">
              <Text className="text-gray-900 text-xl font-bold mb-2">
                Post Not Found
              </Text>
              <Text className="text-gray-500 text-center mb-6">
                This post may have been deleted or doesn't exist.
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="bg-gray-900 px-8 py-3 rounded-xl"
              >
                <Text className="text-white font-medium text-base">Close</Text>
              </TouchableOpacity>
            </View>
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
                  colors={['#3B82F6']}
                  tintColor="#3B82F6"
                />
              }
            >
              {/* Post Content */}
              <View className="p-5 space-y-4">
                {/* Author */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center">
                      <User size={20} color="#6B7280" />
                    </View>
                    <View className="ml-3">
                      <Text className="font-semibold text-gray-900 text-base">
                        {post.user?.username || 'Unknown User'}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Clock size={14} color="#9CA3AF" />
                        <Text className="text-gray-500 text-sm ml-1">
                          {formatTimeAgo(post.created_at)}
                        </Text>
                        {post.updated_at !== post.created_at && (
                          <>
                            <Text className="text-gray-400 mx-1">•</Text>
                            <Edit size={14} color="#9CA3AF" />
                            <Text className="text-gray-500 text-sm ml-1">Edited</Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                  {post.featured && (
                    <View className="bg-blue-100 px-3 py-1.5 rounded-full">
                      <Text className="text-blue-700 text-xs font-medium">
                        Featured
                      </Text>
                    </View>
                  )}
                </View>

                {/* Title */}
                <Text className="text-2xl font-bold text-gray-900 leading-8">
                  {post.title}
                </Text>

                {/* Content */}
                <Text className="text-gray-600 text-base leading-6">
                  {post.content}
                </Text>

                {/* Image - Same rendering as PostContent */}
                {post.image_url && !imageError ? (
                  <View className="relative w-full h-80 rounded-xl mb-3 overflow-hidden bg-gray-100">
                    {imageLoading && (
                      <View className="absolute inset-0 items-center justify-center z-10">
                        <ActivityIndicator size="small" color="#6B7280" />
                      </View>
                    )}
                    <Image
                      source={{ uri: post.image_url }}
                      className="w-full h-80"
                      resizeMode="cover"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  </View>
                ) : imageError ? (
                  <View className="w-full h-48 rounded-xl mb-3 bg-gray-100 items-center justify-center">
                    <Text className="text-gray-400 text-sm">Image not available</Text>
                  </View>
                ) : null}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <View className="flex-row flex-wrap gap-2">
                    {post.tags.map((tag, idx) => (
                      <View
                        key={`${tag}-${idx}`}
                        className="bg-gray-100 rounded-full px-3 py-2"
                      >
                        <Text className="text-gray-700 text-sm font-medium">#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Actions */}
                <View className="flex-row items-center justify-between pt-4 border-t border-gray-100">
                  <View className="flex-row items-center gap-6">
                    {/* Like */}
                    <TouchableOpacity
                      className="flex-row items-center gap-2"
                      onPress={onToggleReaction}
                      activeOpacity={0.7}
                    >
                      <Heart
                        size={24}
                        color={post.isLiked ? '#EF4444' : '#6B7280'}
                        fill={post.isLiked ? '#EF4444' : 'transparent'}
                        strokeWidth={post.isLiked ? 2.5 : 1.5}
                      />
                      <Text className={`font-medium text-base ${
                        post.isLiked ? 'text-red-500' : 'text-gray-600'
                      }`}>
                        {post.likeCount}
                      </Text>
                    </TouchableOpacity>

                    {/* Comments */}
                    <View className="flex-row items-center gap-2">
                      <MessageCircle size={24} color="#6B7280" strokeWidth={1.5} />
                      <Text className="font-medium text-gray-600 text-base">
                        {post.commentCount}
                      </Text>
                    </View>
                  </View>

                  {/* Share */}
                  {onShare && (
                    <TouchableOpacity
                      className="flex-row items-center gap-2"
                      onPress={onShare}
                      activeOpacity={0.7}
                    >
                      <Share2 size={20} color="#6B7280" strokeWidth={1.5} />
                      <Text className="text-gray-600 font-medium text-base">Share</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Comments Section */}
              <View className="bg-gray-50 mt-4 p-5">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-bold text-gray-900">
                    Comments
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                  </Text>
                </View>

                {commentsLoading ? (
                  <View className="py-8 items-center">
                    <ActivityIndicator size="small" color="#6B7280" />
                    <Text className="text-gray-500 text-sm mt-2">
                      Loading comments...
                    </Text>
                  </View>
                ) : comments.length === 0 ? (
                  <View className="py-12 items-center">
                    <MessageCircle size={40} color="#D1D5DB" />
                    <Text className="text-gray-500 text-center mt-3 text-base">
                      No comments yet
                    </Text>
                    <Text className="text-gray-400 text-center mt-1 text-sm">
                      Be the first to comment!
                    </Text>
                  </View>
                ) : (
                  <View className="space-y-4">
                    {comments.map((comment) => (
                      <CommentItem key={comment.comment_id} comment={comment} />
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Comment Input */}
            <View className="bg-white border-t border-gray-100">
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
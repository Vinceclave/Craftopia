// apps/mobile/src/components/feed/PostDetailsModal.tsx - CRAFTOPIA REDESIGN
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
import { X, Heart, MessageCircle, Share2, Clock, Edit, User, AlertCircle, Sparkles } from 'lucide-react-native';
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
    setImageError(false);
  };

  const handleImageError = (error: any) => {
    console.error('📷 [PostDetailsModal] Image load error:', error);
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
        <View className="px-5 py-4 border-b border-craftopa-light/10">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm font-nunito text-craftopa-textSecondary tracking-wide mb-0.5">
                Post Details
              </Text>
              <Text className="text-xl font-poppinsBold text-craftopa-textPrimary tracking-tight">
                Community Post
              </Text>
            </View>
            <TouchableOpacity 
              onPress={onClose}
              className="w-9 h-9 items-center justify-center rounded-xl bg-craftopa-light/10 active:opacity-70 border border-craftopa-light/10"
              activeOpacity={0.7}
            >
              <X size={18} color="#5A7160" />
            </TouchableOpacity>
          </View>
        </View>

        {postLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#5A7160" />
            <Text className="text-craftopa-textSecondary mt-3 font-nunito tracking-wide">Loading post...</Text>
          </View>
        ) : postError || !post ? (
          <View className="flex-1 justify-center items-center px-6">
            <View className="items-center">
              <Text className="text-craftopa-textPrimary text-xl font-poppinsBold mb-2 tracking-tight">
                Post Not Found
              </Text>
              <Text className="text-craftopa-textSecondary text-center mb-6 font-nunito tracking-wide">
                This post may have been deleted or doesn't exist.
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="bg-craftopa-primary px-8 py-3 rounded-xl active:opacity-70"
                activeOpacity={0.7}
              >
                <Text className="text-white font-poppinsBold text-base tracking-tight">Close</Text>
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
                  colors={['#5A7160']}
                  tintColor="#5A7160"
                />
              }
            >
              {/* Post Content */}
              <View className="p-5 space-y-5">
                {/* Author */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 bg-craftopa-light/5 rounded-xl items-center justify-center border border-craftopa-light/10">
                      <User size={20} color="#5A7160" />
                    </View>
                    <View className="ml-3">
                      <Text className="font-poppinsBold text-craftopa-textPrimary text-base tracking-tight">
                        {post.user?.username || 'Unknown User'}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Clock size={14} color="#9CA3AF" />
                        <Text className="text-craftopa-textSecondary text-sm ml-1 font-nunito tracking-wide">
                          {formatTimeAgo(post.created_at)}
                        </Text>
                        {post.updated_at !== post.created_at && (
                          <>
                            <Text className="text-craftopa-textSecondary mx-1">•</Text>
                            <Edit size={14} color="#9CA3AF" />
                            <Text className="text-craftopa-textSecondary text-sm ml-1 font-nunito tracking-wide">Edited</Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                  {post.featured && (
                    <View className="bg-craftopa-accent/10 px-3 py-1.5 rounded-lg border border-craftopa-accent/20">
                      <View className="flex-row items-center gap-1">
                        <Sparkles size={12} color="#D4A96A" />
                        <Text className="text-craftopa-accent text-xs font-poppinsBold tracking-tight">
                          Featured
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Title */}
                <Text className="text-2xl font-poppinsBold text-craftopa-textPrimary leading-8 tracking-tight">
                  {post.title}
                </Text>

                {/* Content */}
                <Text className="text-craftopa-textSecondary text-base leading-6 font-nunito tracking-wide">
                  {post.content}
                </Text>

                {/* Image */}
                {post.image_url && post.image_url.trim() && (
                  <View className="w-full rounded-2xl overflow-hidden bg-craftopa-light/5 border border-craftopa-light/10">
                    {imageLoading && (
                      <View className="absolute inset-0 items-center justify-center z-10">
                        <ActivityIndicator size="large" color="#5A7160" />
                        <Text className="text-craftopa-textSecondary text-sm mt-2 font-nunito tracking-wide">Loading image...</Text>
                      </View>
                    )}
                    
                    {imageError ? (
                      <View className="w-full h-64 items-center justify-center bg-craftopa-light/5">
                        <AlertCircle size={48} color="#EF4444" />
                        <Text className="text-craftopa-textSecondary text-sm mt-3 font-nunito tracking-wide">Failed to load image</Text>
                        <TouchableOpacity
                          onPress={() => {
                            setImageError(false);
                            setImageLoading(true);
                          }}
                          className="mt-3 bg-craftopa-primary px-4 py-2 rounded-lg active:opacity-70"
                          activeOpacity={0.7}
                        >
                          <Text className="text-white text-sm font-poppinsBold tracking-tight">Retry</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <Image
                        source={{ 
                          uri: post.image_url,
                          cache: 'force-cache',
                        }}
                        style={{ 
                          width: '100%', 
                          height: 400,
                          backgroundColor: '#F8FAF7',
                        }}
                        resizeMode="cover"
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        onLoadStart={() => setImageLoading(true)}
                      />
                    )}
                  </View>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <View className="flex-row flex-wrap gap-2">
                    {post.tags.map((tag, idx) => (
                      <View
                        key={`${tag}-${idx}`}
                        className="bg-craftopa-light/5 rounded-full px-3 py-2 border border-craftopa-light/10"
                      >
                        <Text className="text-craftopa-textPrimary text-sm font-poppinsBold tracking-tight">#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Actions */}
                <View className="flex-row items-center justify-between pt-4 border-t border-craftopa-light/10">
                  <View className="flex-row items-center gap-6">
                    {/* Like */}
                    <TouchableOpacity
                      className="flex-row items-center gap-2 active:opacity-70"
                      onPress={onToggleReaction}
                      activeOpacity={0.7}
                    >
                      <Heart
                        size={24}
                        color={post.isLiked ? '#EF4444' : '#5A7160'}
                        fill={post.isLiked ? '#EF4444' : 'transparent'}
                        strokeWidth={post.isLiked ? 2.5 : 2}
                      />
                      <Text className={`font-poppinsBold text-base tracking-tight ${
                        post.isLiked ? 'text-red-500' : 'text-craftopa-textSecondary'
                      }`}>
                        {post.likeCount}
                      </Text>
                    </TouchableOpacity>

                    {/* Comments */}
                    <View className="flex-row items-center gap-2">
                      <MessageCircle size={24} color="#5A7160" strokeWidth={2} />
                      <Text className="font-poppinsBold text-craftopa-textSecondary text-base tracking-tight">
                        {post.commentCount}
                      </Text>
                    </View>
                  </View>

                  {/* Share */}
                  {onShare && (
                    <TouchableOpacity
                      className="flex-row items-center gap-2 active:opacity-70"
                      onPress={onShare}
                      activeOpacity={0.7}
                    >
                      <Share2 size={20} color="#5A7160" strokeWidth={2} />
                      <Text className="text-craftopa-textSecondary font-poppinsBold text-base tracking-tight">Share</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Comments Section */}
              <View className="bg-craftopa-light/5 mt-4 p-5">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-poppinsBold text-craftopa-textPrimary tracking-tight">
                    Comments
                  </Text>
                  <Text className="text-craftopa-textSecondary text-sm font-nunito tracking-wide">
                    {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                  </Text>
                </View>

                {commentsLoading ? (
                  <View className="py-8 items-center">
                    <ActivityIndicator size="small" color="#5A7160" />
                    <Text className="text-craftopa-textSecondary text-sm mt-2 font-nunito tracking-wide">
                      Loading comments...
                    </Text>
                  </View>
                ) : comments.length === 0 ? (
                  <View className="py-12 items-center">
                    <MessageCircle size={40} color="#E5E7EB" />
                    <Text className="text-craftopa-textSecondary text-center mt-3 text-base font-nunito tracking-wide">
                      No comments yet
                    </Text>
                    <Text className="text-craftopa-textSecondary text-center mt-1 text-sm font-nunito tracking-wide">
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
            <View className="bg-white border-t border-craftopa-light/10">
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
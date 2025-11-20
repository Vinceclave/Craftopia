// apps/mobile/src/components/feed/post/PostDetailsModal.tsx - WITH PROFILE PHOTOS
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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Heart, MessageCircle, Share2, Clock, Edit, User, AlertCircle, Sparkles } from 'lucide-react-native';
import { usePost, useComments, useAddComment } from '~/hooks/queries/usePosts';
import { formatTimeAgo } from '~/utils/time';
import { CommentItem } from './comment/CommentItem';
import { CommentInput } from './comment/CommentInput';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const [authorImageError, setAuthorImageError] = useState(false);

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

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  if (!visible) return null;

  // Get author profile picture
  const authorProfilePicture = post?.user?.profile_picture_url;
  const isAuthorEmoji = authorProfilePicture && authorProfilePicture.length <= 2 && !authorProfilePicture.startsWith('http');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-surface">
        {/* Header */}
        <View className="px-4 py-3 border-b border-craftopia-light">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-poppinsBold text-craftopia-textPrimary">
              Post
            </Text>
            <TouchableOpacity 
              onPress={onClose}
              className="w-8 h-8 items-center justify-center rounded-lg bg-craftopia-light active:opacity-70"
              activeOpacity={0.7}
            >
              <X size={16} color="#3B6E4D" />
            </TouchableOpacity>
          </View>
        </View>

        {postLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3B6E4D" />
            <Text className="text-craftopia-textSecondary mt-2 font-nunito">Loading post...</Text>
          </View>
        ) : postError || !post ? (
          <View className="flex-1 justify-center items-center px-4">
            <View className="items-center">
              <Text className="text-craftopia-textPrimary text-lg font-poppinsBold mb-1">
                Post Not Found
              </Text>
              <Text className="text-craftopia-textSecondary text-center mb-4 font-nunito">
                This post may have been deleted or doesn't exist.
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="bg-craftopia-primary px-6 py-2.5 rounded-lg active:opacity-70"
                activeOpacity={0.7}
              >
                <Text className="text-white font-poppinsBold text-sm">Close</Text>
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
                  colors={['#3B6E4D']}
                  tintColor="#3B6E4D"
                />
              }
            >
              {/* Author Header with Profile Photo */}
              <View className="p-4 border-b border-craftopia-light">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    {/* Author Profile Picture */}
                    <View className="w-10 h-10 bg-craftopia-light rounded-lg items-center justify-center border border-craftopia-light overflow-hidden">
                      {isAuthorEmoji || !authorProfilePicture || authorImageError ? (
                        <Text className="text-base">{isAuthorEmoji ? authorProfilePicture : '🧑‍🎨'}</Text>
                      ) : (
                        <Image
                          source={{ uri: authorProfilePicture }}
                          className="w-full h-full"
                          resizeMode="cover"
                          onError={(e) => {
                            console.error('Author image error:', e.nativeEvent.error);
                            setAuthorImageError(true);
                          }}
                        />
                      )}
                    </View>
                    
                    <View className="ml-2">
                      <Text className="font-poppinsBold text-craftopia-textPrimary text-sm">
                        {post.user?.username || 'Unknown User'}
                      </Text>
                      <View className="flex-row items-center mt-0.5">
                        <Clock size={12} color="#5F6F64" />
                        <Text className="text-craftopia-textSecondary text-xs ml-1 font-nunito">
                          {formatTimeAgo(post.created_at)}
                        </Text>
                        {post.updated_at !== post.created_at && (
                          <>
                            <Text className="text-craftopia-textSecondary mx-1">•</Text>
                            <Edit size={12} color="#5F6F64" />
                            <Text className="text-craftopia-textSecondary text-xs ml-1 font-nunito">Edited</Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                  
                  {post.featured && (
                    <View className="bg-craftopia-warning/10 px-2 py-1 rounded-md border border-craftopia-warning/20">
                      <View className="flex-row items-center gap-1">
                        <Sparkles size={12} color="#E3A84F" />
                        <Text className="text-craftopia-warning text-xs font-poppinsBold">
                          Featured
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* Content */}
              <View className="p-4 border-b border-craftopia-light">
                <Text className="text-lg font-poppinsBold text-craftopia-textPrimary mb-2">
                  {post.title}
                </Text>
                <Text className="text-craftopia-textSecondary text-sm leading-5 font-nunito">
                  {post.content}
                </Text>
              </View>

              {/* Facebook-style Large Image */}
              {post.image_url && post.image_url.trim() && (
                <View className="border-b border-craftopia-light">
                  {imageLoading && (
                    <View className="w-full h-80 items-center justify-center bg-craftopia-light">
                      <ActivityIndicator size="large" color="#3B6E4D" />
                      <Text className="text-craftopia-textSecondary text-sm mt-2 font-nunito">Loading image...</Text>
                    </View>
                  )}
                  
                  {imageError ? (
                    <View className="w-full h-64 items-center justify-center bg-craftopia-light">
                      <AlertCircle size={32} color="#D66B4E" />
                      <Text className="text-craftopia-textSecondary text-sm mt-2 font-nunito">Failed to load image</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setImageError(false);
                          setImageLoading(true);
                        }}
                        className="mt-2 bg-craftopia-primary px-3 py-1.5 rounded-md active:opacity-70"
                        activeOpacity={0.7}
                      >
                        <Text className="text-white text-xs font-poppinsBold">Retry</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="relative">
                      <Image
                        source={{ 
                          uri: post.image_url,
                          cache: 'force-cache',
                        }}
                        style={{ 
                          width: SCREEN_WIDTH,
                          height: SCREEN_WIDTH,
                          backgroundColor: '#F5F7F2',
                        }}
                        resizeMode="cover"
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        onLoadStart={() => setImageLoading(true)}
                      />
                    </View>
                  )}
                </View>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <View className="p-4 border-b border-craftopia-light">
                  <View className="flex-row flex-wrap gap-1.5">
                    {post.tags.map((tag, idx) => (
                      <View
                        key={`${tag}-${idx}`}
                        className="bg-craftopia-light rounded-full px-2.5 py-1 border border-craftopia-light"
                      >
                        <Text className="text-craftopia-textPrimary text-xs font-poppinsBold">#{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Actions Bar */}
              <View className="p-3 border-b border-craftopia-light">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="w-5 h-5 bg-craftopia-primary rounded-full items-center justify-center">
                      <Heart size={12} color="#FFFFFF" fill="#FFFFFF" />
                    </View>
                    <Text className="text-craftopia-textSecondary text-xs ml-1 font-nunito">
                      {post.likeCount}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <Text className="text-craftopia-textSecondary text-xs font-nunito">
                      {post.commentCount} comments
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between mt-2">
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center py-2 rounded-md active:opacity-70"
                    onPress={onToggleReaction}
                    activeOpacity={0.7}
                  >
                    <Heart
                      size={18}
                      color={post.isLiked ? '#D66B4E' : '#5F6F64'}
                      fill={post.isLiked ? '#D66B4E' : 'transparent'}
                    />
                    <Text className={`ml-1.5 text-sm font-poppinsBold ${
                      post.isLiked ? 'text-craftopia-error' : 'text-craftopia-textSecondary'
                    }`}>
                      Like
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center py-2 rounded-md active:opacity-70"
                    activeOpacity={0.7}
                  >
                    <MessageCircle size={18} color="#5F6F64" />
                    <Text className="ml-1.5 text-sm font-poppinsBold text-craftopia-textSecondary">
                      Comment
                    </Text>
                  </TouchableOpacity>

                  {onShare && (
                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center py-2 rounded-md active:opacity-70"
                      onPress={onShare}
                      activeOpacity={0.7}
                    >
                      <Share2 size={18} color="#5F6F64" />
                      <Text className="ml-1.5 text-sm font-poppinsBold text-craftopia-textSecondary">
                        Share
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Comments Section */}
              <View className="p-4">
                <Text className="text-base font-poppinsBold text-craftopia-textPrimary mb-3">
                  Comments
                </Text>

                {commentsLoading ? (
                  <View className="py-6 items-center">
                    <ActivityIndicator size="small" color="#3B6E4D" />
                    <Text className="text-craftopia-textSecondary text-sm mt-1 font-nunito">
                      Loading comments...
                    </Text>
                  </View>
                ) : comments.length === 0 ? (
                  <View className="py-8 items-center">
                    <MessageCircle size={32} color="#F5F7F2" />
                    <Text className="text-craftopia-textSecondary text-center mt-2 text-sm font-nunito">
                      No comments yet
                    </Text>
                    <Text className="text-craftopia-textSecondary text-center mt-0.5 text-xs font-nunito">
                      Be the first to comment!
                    </Text>
                  </View>
                ) : (
                  <View className="space-y-3">
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
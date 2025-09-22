import React, { useRef, useState } from 'react';
import { Modal, View, Text, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';

interface Comment {
  comment_id: number;
  user_id: number;
  content: string;
  likeCount: number;
  isLiked: boolean;
  created_at: string;
  user: { user_id: number; username: string };
}

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  postTitle: string;
  comments: Comment[];
  loading?: boolean;
  onAddComment: (content: string) => Promise<void>;
  onToggleCommentReaction: (commentId: number) => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  visible,
  onClose,
  postTitle,
  comments,
  loading = false,
  onAddComment,
  onToggleCommentReaction,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSend = async (content: string) => {
    setSubmitting(true);
    try {
      await onAddComment(content);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
            <View className="flex-1">
              <Text className="font-semibold text-gray-900 text-lg">Comments</Text>
              <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>{postTitle}</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="ml-4">
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <ScrollView ref={scrollRef} className="flex-1 px-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {loading ? (
              <View className="flex-1 justify-center items-center py-20">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="text-gray-500 mt-2">Loading comments...</Text>
              </View>
            ) : comments.length === 0 ? (
              <View className="flex-1 justify-center items-center py-20">
                <Text className="text-gray-500 text-center">No comments yet. Be the first to comment!</Text>
              </View>
            ) : (
              <View className="py-4">{comments.map(c => <CommentItem key={c.comment_id} comment={c} onToggleReaction={onToggleCommentReaction} />)}</View>
            )}
          </ScrollView>

          {/* Comment Input */}
          <CommentInput onSend={handleSend} submitting={submitting} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

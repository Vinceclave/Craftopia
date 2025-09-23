import React, { useRef, useState } from 'react';
import { 
  Modal, View, Text, ScrollView, ActivityIndicator, 
  KeyboardAvoidingView, Platform, TouchableOpacity
} from 'react-native';
import { X } from 'lucide-react-native';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';
import { Comment } from '../type';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => onClose();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-surface">
        <KeyboardAvoidingView 
          className="flex-1" 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-craftopia-light">
            <View className="flex-1 pr-3">
              <Text className="font-semibold text-craftopia-textPrimary text-base">Comments</Text>
              <Text className="text-sm text-craftopia-textSecondary mt-0.5" numberOfLines={1}>
                {postTitle}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} className="p-1" activeOpacity={0.8}>
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <ScrollView
            ref={scrollRef}
            className="flex-1 px-4"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {loading ? (
              <View className="flex-1 justify-center items-center py-16">
                <ActivityIndicator size="small" color="#004E98" />
                <Text className="text-craftopia-textSecondary text-sm mt-2">Loading comments...</Text>
              </View>
            ) : comments.length === 0 ? (
              <View className="flex-1 justify-center items-center py-16">
                <Text className="text-craftopia-textSecondary text-sm text-center">
                  No comments yet. Be the first to comment!
                </Text>
              </View>
            ) : (
              <View className="py-3">
                {comments.map(comment => (
                  <CommentItem 
                    key={comment.comment_id} 
                    comment={comment} 
                    onToggleReaction={onToggleCommentReaction} 
                  />
                ))}
              </View>
            )}
          </ScrollView>

          {/* Comment Input */}
          <CommentInput onSend={handleSend} submitting={submitting} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};
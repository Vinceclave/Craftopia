// apps/mobile/src/components/feed/comment/CommentModal.tsx - CRAFTOPIA REFINED
import React, { useRef } from 'react';
import { 
  Modal, View, Text, ScrollView, ActivityIndicator, 
  KeyboardAvoidingView, Platform, TouchableOpacity
} from 'react-native';
import { X, MessageCircle } from 'lucide-react-native';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';
import { Comment } from '~/hooks/queries/usePosts';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  postTitle: string;
  comments: Comment[];
  loading?: boolean;
  submitting?: boolean;
  onAddComment: (content: string) => Promise<void>;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  visible,
  onClose,
  postTitle,
  comments,
  loading = false,
  submitting = false,
  onAddComment,
}) => {
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = async (content: string) => {
    await onAddComment(content);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      presentationStyle="pageSheet" 
      onRequestClose={onClose}
    >
      <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-surface">
        <KeyboardAvoidingView 
          className="flex-1" 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        >
          {/* Header */}
          <View className="px-4 py-3 border-b border-craftopia-light">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center">
                  <MessageCircle size={18} color="#3B6E4D" />
                  <Text className="font-poppinsBold text-craftopia-textPrimary text-lg ml-2">
                    Comments
                  </Text>
                </View>
                <Text className="text-craftopia-textSecondary text-sm mt-0.5 font-nunito" numberOfLines={1}>
                  {postTitle}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={onClose} 
                className="w-8 h-8 items-center justify-center rounded-lg bg-craftopia-light active:opacity-70"
                activeOpacity={0.7}
              >
                <X size={16} color="#3B6E4D" />
              </TouchableOpacity>
            </View>
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
                <ActivityIndicator size="large" color="#3B6E4D" />
                <Text className="text-craftopia-textSecondary mt-2 font-nunito">
                  Loading comments...
                </Text>
              </View>
            ) : comments.length === 0 ? (
              <View className="flex-1 justify-center items-center py-16">
                <MessageCircle size={40} color="#F5F7F2" />
                <Text className="text-craftopia-textSecondary text-base mt-2 text-center font-nunito">
                  No comments yet
                </Text>
                <Text className="text-craftopia-textSecondary text-sm mt-0.5 text-center font-nunito">
                  Be the first to comment!
                </Text>
              </View>
            ) : (
              <View className="py-3">
                <View className="mb-3">
                  <Text className="text-craftopia-textPrimary font-poppinsBold text-sm">
                    {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                  </Text>
                </View>
                {comments.map(comment => (
                  <CommentItem 
                    key={comment.comment_id} 
                    comment={comment}
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
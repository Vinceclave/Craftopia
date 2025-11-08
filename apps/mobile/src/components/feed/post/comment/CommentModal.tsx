// apps/mobile/src/components/feed/comment/CommentModal.tsx - CRAFTOPIA REDESIGN
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
      <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
        <KeyboardAvoidingView 
          className="flex-1" 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        >
          {/* Header */}
          <View className="px-5 py-4 border-b border-craftopa-light/10">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center">
                  <MessageCircle size={20} color="#5A7160" />
                  <Text className="font-poppinsBold text-craftopa-textPrimary text-xl ml-2 tracking-tight">
                    Comments
                  </Text>
                </View>
                <Text className="text-craftopa-textSecondary text-sm mt-1 font-nunito tracking-wide" numberOfLines={1}>
                  {postTitle}
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

          {/* Comments List */}
          <ScrollView
            ref={scrollRef}
            className="flex-1 px-5"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {loading ? (
              <View className="flex-1 justify-center items-center py-20">
                <ActivityIndicator size="large" color="#5A7160" />
                <Text className="text-craftopa-textSecondary mt-3 font-nunito tracking-wide">
                  Loading comments...
                </Text>
              </View>
            ) : comments.length === 0 ? (
              <View className="flex-1 justify-center items-center py-20">
                <MessageCircle size={48} color="#E5E7EB" />
                <Text className="text-craftopa-textSecondary text-lg mt-3 text-center font-nunito tracking-wide">
                  No comments yet
                </Text>
                <Text className="text-craftopa-textSecondary text-sm mt-1 text-center font-nunito tracking-wide">
                  Be the first to comment!
                </Text>
              </View>
            ) : (
              <View className="py-4">
                <View className="mb-4">
                  <Text className="text-craftopa-textPrimary font-poppinsBold text-base tracking-tight">
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
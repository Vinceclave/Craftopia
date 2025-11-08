// apps/mobile/src/components/feed/comment/CommentModal.tsx - FIXED
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
          <View className="px-5 py-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center">
                  <MessageCircle size={20} color="#374151" />
                  <Text className="font-bold text-gray-900 text-xl ml-2">Comments</Text>
                </View>
                <Text className="text-gray-600 text-sm mt-1" numberOfLines={1}>
                  {postTitle}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={onClose} 
                className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
              >
                <X size={20} color="#6B7280" />
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
                <ActivityIndicator size="large" color="#6B7280" />
                <Text className="text-gray-500 mt-3">Loading comments...</Text>
              </View>
            ) : comments.length === 0 ? (
              <View className="flex-1 justify-center items-center py-20">
                <MessageCircle size={48} color="#D1D5DB" />
                <Text className="text-gray-500 text-lg mt-3 text-center">
                  No comments yet
                </Text>
                <Text className="text-gray-400 text-sm mt-1 text-center">
                  Be the first to comment!
                </Text>
              </View>
            ) : (
              <View className="py-4">
                <View className="mb-4">
                  <Text className="text-gray-900 font-semibold text-base">
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
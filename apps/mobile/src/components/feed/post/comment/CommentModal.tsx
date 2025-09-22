import React, { useRef, useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  SafeAreaView, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { X } from 'lucide-react-native';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';
import { Comment } from '../type';

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
  const [modalHeight, setModalHeight] = useState(Dimensions.get('window').height);

  useEffect(() => {
    console.log('CommentModal rendered with visible:', visible);
    console.log('Comments count:', comments.length);
  }, [visible, comments]);

  const handleSend = async (content: string) => {
    console.log('Sending comment:', content);
    setSubmitting(true);
    try {
      await onAddComment(content);
      // Scroll to bottom after adding comment
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    console.log('Closing comment modal');
    onClose();
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
      transparent={false}
    >
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView 
          className="flex-1" 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
            <View className="flex-1 pr-4">
              <Text className="font-semibold text-gray-900 text-lg">Comments</Text>
              <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
                {postTitle}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handleClose} 
              className="p-2"
              activeOpacity={0.7}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <ScrollView 
            ref={scrollRef} 
            className="flex-1 px-4" 
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {loading ? (
              <View className="flex-1 justify-center items-center py-20">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="text-gray-500 mt-2">Loading comments...</Text>
              </View>
            ) : comments.length === 0 ? (
              <View className="flex-1 justify-center items-center py-20">
                <Text className="text-gray-500 text-center">
                  No comments yet. Be the first to comment!
                </Text>
              </View>
            ) : (
              <View className="py-4">
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
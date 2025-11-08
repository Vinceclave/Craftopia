// apps/mobile/src/components/feed/post/EditPostModal.tsx - MODERN MINIMALISTIC
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Edit3, Tag, AlertCircle } from 'lucide-react-native';

interface EditPostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string; tags?: string[] }) => Promise<void>;
  initialData: {
    title: string;
    content: string;
    tags?: string[];
  };
  loading?: boolean;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}) => {
  const [title, setTitle] = useState(initialData.title);
  const [content, setContent] = useState(initialData.content);
  const [tagsInput, setTagsInput] = useState(initialData.tags?.join(', ') || '');
  const [errors, setErrors] = useState({ title: '', content: '' });

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setTagsInput(initialData.tags?.join(', ') || '');
      setErrors({ title: '', content: '' });
    }
  }, [visible, initialData]);

  const validate = () => {
    const newErrors = { title: '', content: '' };
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    } else if (title.length > 255) {
      newErrors.title = 'Title cannot exceed 255 characters';
      isValid = false;
    }

    if (!content.trim()) {
      newErrors.content = 'Content is required';
      isValid = false;
    } else if (content.length > 1000) {
      newErrors.content = 'Content cannot exceed 1000 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        tags: tags.length > 0 ? tags : undefined,
      });
    } catch (error) {
      console.error('Edit submit error:', error);
    }
  };

  const hasChanges =
    title !== initialData.title ||
    content !== initialData.content ||
    tagsInput !== initialData.tags?.join(', ');

  const canSubmit = hasChanges && !loading && title.trim() && content.trim();

  const CharacterCounter = ({ current, max, warningThreshold = 0.9 }: { current: number; max: number; warningThreshold?: number }) => (
    <Text className={`text-xs ${current > max * warningThreshold ? 'text-orange-500' : 'text-gray-400'}`}>
      {current}/{max}
    </Text>
  );

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
          <View className="px-5 py-4 border-b border-gray-100">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Edit3 size={20} color="#1F2937" />
                <Text className="text-xl font-semibold text-gray-900 ml-2">
                  Edit Post
                </Text>
              </View>
              <TouchableOpacity 
                onPress={onClose}
                className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
                disabled={loading}
              >
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="p-5 space-y-6">
              {/* Title Input */}
              <View>
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-sm font-medium text-gray-700">
                    Title
                  </Text>
                  <CharacterCounter current={title.length} max={255} />
                </View>
                <TextInput
                  value={title}
                  onChangeText={(text) => {
                    setTitle(text);
                    if (errors.title) setErrors({ ...errors, title: '' });
                  }}
                  placeholder="Enter post title..."
                  placeholderTextColor="#9CA3AF"
                  maxLength={255}
                  className={`bg-gray-50 border rounded-xl px-4 py-3 text-gray-900 text-base ${
                    errors.title ? 'border-red-300' : 'border-gray-200'
                  }`}
                  editable={!loading}
                />
                {errors.title && (
                  <View className="flex-row items-center mt-2">
                    <AlertCircle size={14} color="#EF4444" />
                    <Text className="text-red-500 text-sm ml-1">{errors.title}</Text>
                  </View>
                )}
              </View>

              {/* Content Input */}
              <View>
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-sm font-medium text-gray-700">
                    Content
                  </Text>
                  <CharacterCounter current={content.length} max={1000} />
                </View>
                <TextInput
                  value={content}
                  onChangeText={(text) => {
                    setContent(text);
                    if (errors.content) setErrors({ ...errors, content: '' });
                  }}
                  placeholder="Share your thoughts..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={8}
                  maxLength={1000}
                  textAlignVertical="top"
                  className={`bg-gray-50 border rounded-xl px-4 py-3 text-gray-900 text-base ${
                    errors.content ? 'border-red-300' : 'border-gray-200'
                  }`}
                  style={{ minHeight: 160 }}
                  editable={!loading}
                />
                {errors.content && (
                  <View className="flex-row items-center mt-2">
                    <AlertCircle size={14} color="#EF4444" />
                    <Text className="text-red-500 text-sm ml-1">{errors.content}</Text>
                  </View>
                )}
              </View>

              {/* Tags Input */}
              <View>
                <View className="flex-row items-center mb-3">
                  <Tag size={16} color="#6B7280" />
                  <Text className="text-sm font-medium text-gray-700 ml-2">
                    Tags (optional)
                  </Text>
                </View>
                <TextInput
                  value={tagsInput}
                  onChangeText={setTagsInput}
                  placeholder="craft, recycling, DIY..."
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-base"
                  editable={!loading}
                />
                <Text className="text-xs text-gray-500 mt-2">
                  Separate tags with commas
                </Text>

                {/* Tag Preview */}
                {tagsInput.trim() && (
                  <View className="flex-row flex-wrap gap-2 mt-3">
                    {tagsInput
                      .split(',')
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                      .map((tag, index) => (
                        <View
                          key={index}
                          className="bg-blue-100 px-3 py-2 rounded-full flex-row items-center"
                        >
                          <Text className="text-blue-700 text-sm font-medium">
                            #{tag}
                          </Text>
                          <TouchableOpacity
                            className="ml-2"
                            onPress={() => {
                              const tags = tagsInput
                                .split(',')
                                .map((t) => t.trim())
                                .filter((t, i) => i !== index);
                              setTagsInput(tags.join(', '));
                            }}
                            disabled={loading}
                          >
                            <X size={14} color="#1D4ED8" />
                          </TouchableOpacity>
                        </View>
                      ))}
                  </View>
                )}
              </View>

              {/* Info Message */}
              <View className="bg-blue-50 rounded-xl p-4">
                <View className="flex-row items-start">
                  <AlertCircle size={16} color="#3B82F6" className="mt-0.5" />
                  <Text className="text-blue-700 text-sm ml-2 flex-1">
                    Your changes will be saved immediately and visible to all users.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View className="px-5 py-4 border-t border-gray-100 bg-white">
            <View className="space-y-3">
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!canSubmit}
                className={`py-4 rounded-xl items-center ${
                  canSubmit ? 'bg-gray-900' : 'bg-gray-300'
                }`}
              >
                <Text className={`font-semibold text-base ${
                  canSubmit ? 'text-white' : 'text-gray-500'
                }`}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                className="py-3 items-center"
                activeOpacity={0.7}
                disabled={loading}
              >
                <Text className="text-gray-600 font-medium">Cancel</Text>
              </TouchableOpacity>

              {!hasChanges && !loading && (
                <Text className="text-center text-sm text-gray-400">
                  No changes made
                </Text>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};
// apps/mobile/src/components/feed/post/EditPostModal.tsx
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
import { X, Edit3 } from 'lucide-react-native';
import Button from '~/components/common/Button';

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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-light">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={onClose} className="mr-3" disabled={loading}>
                <X size={20} color="#1A1A1A" />
              </TouchableOpacity>
              <View className="flex-row items-center">
                <Edit3 size={16} color="#374A36" />
                <Text className="text-base font-semibold text-craftopia-textPrimary ml-2">
                  Edit Post
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmit}
              className={`px-3 py-1.5 rounded-full ${
                canSubmit ? 'bg-craftopia-primary' : 'bg-craftopia-light'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  canSubmit ? 'text-white' : 'text-craftopia-textSecondary'
                }`}
              >
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="p-4">
              {/* Title Input */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-craftopia-textSecondary mb-2">
                  Title *
                </Text>
                <TextInput
                  value={title}
                  onChangeText={(text) => {
                    setTitle(text);
                    if (errors.title) setErrors({ ...errors, title: '' });
                  }}
                  placeholder="Post title"
                  placeholderTextColor="#9CA3AF"
                  maxLength={255}
                  className={`bg-craftopia-surface border rounded-lg px-3 py-2.5 text-craftopia-textPrimary ${
                    errors.title ? 'border-red-400' : 'border-craftopia-light'
                  }`}
                  editable={!loading}
                />
                {errors.title ? (
                  <Text className="text-xs text-red-500 mt-1">{errors.title}</Text>
                ) : (
                  <Text
                    className={`text-xs mt-1 ${
                      title.length > 230 ? 'text-orange-600' : 'text-craftopia-textSecondary'
                    }`}
                  >
                    {title.length}/255 characters
                  </Text>
                )}
              </View>

              {/* Content Input */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-craftopia-textSecondary mb-2">
                  Content *
                </Text>
                <TextInput
                  value={content}
                  onChangeText={(text) => {
                    setContent(text);
                    if (errors.content) setErrors({ ...errors, content: '' });
                  }}
                  placeholder="Share your thoughts..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={6}
                  maxLength={1000}
                  textAlignVertical="top"
                  className={`bg-craftopia-surface border rounded-lg px-3 py-2.5 text-craftopia-textPrimary ${
                    errors.content ? 'border-red-400' : 'border-craftopia-light'
                  }`}
                  style={{ minHeight: 120 }}
                  editable={!loading}
                />
                {errors.content ? (
                  <Text className="text-xs text-red-500 mt-1">{errors.content}</Text>
                ) : (
                  <Text
                    className={`text-xs mt-1 ${
                      content.length > 950 ? 'text-orange-600' : 'text-craftopia-textSecondary'
                    }`}
                  >
                    {content.length}/1000 characters
                  </Text>
                )}
              </View>

              {/* Tags Input */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-craftopia-textSecondary mb-2">
                  Tags (optional)
                </Text>
                <TextInput
                  value={tagsInput}
                  onChangeText={setTagsInput}
                  placeholder="craft, recycling, DIY (comma separated)"
                  placeholderTextColor="#9CA3AF"
                  className="bg-craftopia-surface border border-craftopia-light rounded-lg px-3 py-2.5 text-craftopia-textPrimary"
                  editable={!loading}
                />
                <Text className="text-xs text-craftopia-textSecondary mt-1">
                  Separate tags with commas
                </Text>

                {/* Tag Preview */}
                {tagsInput.trim() && (
                  <View className="flex-row flex-wrap gap-1.5 mt-2">
                    {tagsInput
                      .split(',')
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                      .map((tag, index) => (
                        <View
                          key={index}
                          className="bg-craftopia-primary/10 px-2.5 py-1 rounded-full flex-row items-center"
                        >
                          <Text className="text-craftopia-primary text-xs font-medium">
                            #{tag}
                          </Text>
                          <TouchableOpacity
                            className="ml-1"
                            onPress={() => {
                              const tags = tagsInput
                                .split(',')
                                .map((t) => t.trim())
                                .filter((t, i) => i !== index);
                              setTagsInput(tags.join(', '));
                            }}
                            disabled={loading}
                          >
                            <X size={12} color="#374A36" />
                          </TouchableOpacity>
                        </View>
                      ))}
                  </View>
                )}
              </View>

              {/* Info Message */}
              <View className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
                <Text className="text-sm text-blue-800">
                  ℹ️ Your changes will be saved immediately and visible to all users.
                </Text>
              </View>

              {/* Action Buttons */}
              <View className="space-y-2">
                <Button
                  title={loading ? 'Saving Changes...' : 'Save Changes'}
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                  loading={loading}
                  size="md"
                />

                <TouchableOpacity
                  onPress={onClose}
                  className="py-3 items-center"
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  <Text className="text-craftopia-textSecondary font-medium">Cancel</Text>
                </TouchableOpacity>
              </View>

              {!hasChanges && !loading && (
                <Text className="text-center text-xs text-craftopia-textSecondary mt-2">
                  No changes made
                </Text>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};
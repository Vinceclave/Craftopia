// apps/mobile/src/components/feed/post/EditPostModal.tsx - CRAFTOPIA REFINED
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
  ActivityIndicator,
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
    <Text className={`text-xs font-nunito ${current > max * warningThreshold ? 'text-craftopia-warning' : 'text-craftopia-textSecondary'}`}>
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
      <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-surface">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View className="px-4 py-3 border-b border-craftopia-light">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Edit3 size={18} color="#3B6E4D" />
                <Text className="text-lg font-poppinsBold text-craftopia-textPrimary ml-2">
                  Edit Post
                </Text>
              </View>
              <TouchableOpacity 
                onPress={onClose}
                className="w-9 h-9 items-center justify-center rounded-lg bg-craftopia-light active:opacity-70"
                disabled={loading}
                activeOpacity={0.7}
              >
                <X size={16} color="#3B6E4D" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="p-4 space-y-4">
              {/* Title Input */}
              <View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-poppinsBold text-craftopia-textPrimary">
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
                  placeholderTextColor="#5F6F64"
                  maxLength={255}
                  className={`bg-craftopia-surface border rounded-xl px-3 py-2.5 text-craftopia-textPrimary text-sm font-nunito ${
                    errors.title ? 'border-craftopia-error' : 'border-craftopia-light'
                  }`}
                  editable={!loading}
                />
                {errors.title && (
                  <View className="flex-row items-center mt-1">
                    <AlertCircle size={12} color="#D66B4E" />
                    <Text className="text-craftopia-error text-xs ml-1 font-nunito">{errors.title}</Text>
                  </View>
                )}
              </View>

              {/* Content Input */}
              <View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-poppinsBold text-craftopia-textPrimary">
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
                  placeholderTextColor="#5F6F64"
                  multiline
                  numberOfLines={8}
                  maxLength={1000}
                  textAlignVertical="top"
                  className={`bg-craftopia-surface border rounded-xl px-3 py-2.5 text-craftopia-textPrimary text-sm font-nunito ${
                    errors.content ? 'border-craftopia-error' : 'border-craftopia-light'
                  }`}
                  style={{ minHeight: 140 }}
                  editable={!loading}
                />
                {errors.content && (
                  <View className="flex-row items-center mt-1">
                    <AlertCircle size={12} color="#D66B4E" />
                    <Text className="text-craftopia-error text-xs ml-1 font-nunito">{errors.content}</Text>
                  </View>
                )}
              </View>

              {/* Tags Input */}
              <View>
                <View className="flex-row items-center mb-2">
                  <Tag size={14} color="#3B6E4D" />
                  <Text className="text-sm font-poppinsBold text-craftopia-textPrimary ml-2">
                    Tags (optional)
                  </Text>
                </View>
                <TextInput
                  value={tagsInput}
                  onChangeText={setTagsInput}
                  placeholder="craft, recycling, DIY..."
                  placeholderTextColor="#5F6F64"
                  className="bg-craftopia-surface border border-craftopia-light rounded-xl px-3 py-2.5 text-craftopia-textPrimary text-sm font-nunito"
                  editable={!loading}
                />
                <Text className="text-xs text-craftopia-textSecondary mt-1 font-nunito">
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
                          className="bg-craftopia-primary/5 px-2 py-1 rounded-full flex-row items-center border border-craftopia-primary/20"
                        >
                          <Text className="text-craftopia-primary text-xs font-poppinsBold">
                            #{tag}
                          </Text>
                          <TouchableOpacity
                            className="ml-1 active:opacity-70"
                            onPress={() => {
                              const tags = tagsInput
                                .split(',')
                                .map((t) => t.trim())
                                .filter((t, i) => i !== index);
                              setTagsInput(tags.join(', '));
                            }}
                            disabled={loading}
                            activeOpacity={0.7}
                          >
                            <X size={12} color="#3B6E4D" />
                          </TouchableOpacity>
                        </View>
                      ))}
                  </View>
                )}
              </View>

              {/* Info Message */}
              <View className="bg-craftopia-primary/5 rounded-xl p-3 border border-craftopia-primary/20">
                <View className="flex-row items-start">
                  <AlertCircle size={14} color="#3B6E4D" className="mt-0.5" />
                  <Text className="text-craftopia-textPrimary text-sm ml-2 flex-1 font-nunito">
                    Your changes will be saved immediately and visible to all users.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View className="px-4 py-3 border-t border-craftopia-light bg-craftopia-surface">
            <View className="space-y-2">
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!canSubmit}
                className={`py-3 rounded-xl items-center flex-row justify-center active:opacity-70 border ${
                  canSubmit 
                    ? 'bg-craftopia-primary border-craftopia-primary' 
                    : 'bg-craftopia-light border-craftopia-light'
                }`}
                activeOpacity={0.7}
              >
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text className="text-white text-sm font-poppinsBold ml-2">
                      Saving...
                    </Text>
                  </>
                ) : (
                  <Text className={`text-sm font-poppinsBold ${
                    canSubmit ? 'text-white' : 'text-craftopia-textSecondary'
                  }`}>
                    Save Changes
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                className="py-2 items-center active:opacity-70"
                activeOpacity={0.7}
                disabled={loading}
              >
                <Text className="text-craftopia-textSecondary font-poppinsBold">Cancel</Text>
              </TouchableOpacity>

              {!hasChanges && !loading && (
                <Text className="text-center text-xs text-craftopia-textSecondary font-nunito">
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
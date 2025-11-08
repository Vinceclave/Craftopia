// apps/mobile/src/components/feed/post/EditPostModal.tsx - CRAFTOPIA REDESIGN
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
    <Text className={`text-xs font-nunito tracking-wide ${current > max * warningThreshold ? 'text-orange-500' : 'text-craftopa-textSecondary'}`}>
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
          <View className="px-5 py-4 border-b border-craftopa-light/10">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Edit3 size={20} color="#5A7160" />
                <Text className="text-xl font-poppinsBold text-craftopa-textPrimary ml-2 tracking-tight">
                  Edit Post
                </Text>
              </View>
              <TouchableOpacity 
                onPress={onClose}
                className="w-9 h-9 items-center justify-center rounded-xl bg-craftopa-light/5 active:opacity-70 border border-craftopa-light/10"
                disabled={loading}
                activeOpacity={0.7}
              >
                <X size={18} color="#5A7160" />
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
                  <Text className="text-sm font-poppinsBold text-craftopa-textPrimary tracking-tight">
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
                  className={`bg-white border rounded-2xl px-4 py-3 text-craftopa-textPrimary text-base font-nunito tracking-wide ${
                    errors.title ? 'border-red-300' : 'border-craftopa-light/10'
                  }`}
                  editable={!loading}
                />
                {errors.title && (
                  <View className="flex-row items-center mt-2">
                    <AlertCircle size={14} color="#EF4444" />
                    <Text className="text-red-500 text-sm ml-1 font-nunito tracking-wide">{errors.title}</Text>
                  </View>
                )}
              </View>

              {/* Content Input */}
              <View>
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-sm font-poppinsBold text-craftopa-textPrimary tracking-tight">
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
                  className={`bg-white border rounded-2xl px-4 py-3 text-craftopa-textPrimary text-base font-nunito tracking-wide ${
                    errors.content ? 'border-red-300' : 'border-craftopa-light/10'
                  }`}
                  style={{ minHeight: 160 }}
                  editable={!loading}
                />
                {errors.content && (
                  <View className="flex-row items-center mt-2">
                    <AlertCircle size={14} color="#EF4444" />
                    <Text className="text-red-500 text-sm ml-1 font-nunito tracking-wide">{errors.content}</Text>
                  </View>
                )}
              </View>

              {/* Tags Input */}
              <View>
                <View className="flex-row items-center mb-3">
                  <Tag size={16} color="#5A7160" />
                  <Text className="text-sm font-poppinsBold text-craftopa-textPrimary ml-2 tracking-tight">
                    Tags (optional)
                  </Text>
                </View>
                <TextInput
                  value={tagsInput}
                  onChangeText={setTagsInput}
                  placeholder="craft, recycling, DIY..."
                  placeholderTextColor="#9CA3AF"
                  className="bg-white border border-craftopa-light/10 rounded-2xl px-4 py-3 text-craftopa-textPrimary text-base font-nunito tracking-wide"
                  editable={!loading}
                />
                <Text className="text-xs text-craftopa-textSecondary mt-2 font-nunito tracking-wide">
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
                          className="bg-craftopa-primary/5 px-3 py-2 rounded-full flex-row items-center border border-craftopa-primary/10"
                        >
                          <Text className="text-craftopa-primary text-sm font-poppinsBold tracking-tight">
                            #{tag}
                          </Text>
                          <TouchableOpacity
                            className="ml-2 active:opacity-70"
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
                            <X size={14} color="#5A7160" />
                          </TouchableOpacity>
                        </View>
                      ))}
                  </View>
                )}
              </View>

              {/* Info Message */}
              <View className="bg-craftopa-primary/5 rounded-2xl p-4 border border-craftopa-primary/10">
                <View className="flex-row items-start">
                  <AlertCircle size={16} color="#5A7160" className="mt-0.5" />
                  <Text className="text-craftopa-textPrimary text-sm ml-3 flex-1 font-nunito tracking-wide">
                    Your changes will be saved immediately and visible to all users.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View className="px-5 py-4 border-t border-craftopa-light/10 bg-white">
            <View className="space-y-3">
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!canSubmit}
                className={`py-4 rounded-2xl items-center flex-row justify-center active:opacity-70 border ${
                  canSubmit 
                    ? 'bg-craftopa-primary border-craftopa-primary/20' 
                    : 'bg-craftopa-light/10 border-craftopa-light/20'
                }`}
                activeOpacity={0.7}
              >
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text className="text-white text-base font-poppinsBold ml-2 tracking-tight">
                      Saving...
                    </Text>
                  </>
                ) : (
                  <Text className={`text-base font-poppinsBold tracking-tight ${
                    canSubmit ? 'text-white' : 'text-craftopa-textSecondary'
                  }`}>
                    Save Changes
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                className="py-3 items-center active:opacity-70"
                activeOpacity={0.7}
                disabled={loading}
              >
                <Text className="text-craftopa-textSecondary font-poppinsBold tracking-tight">Cancel</Text>
              </TouchableOpacity>

              {!hasChanges && !loading && (
                <Text className="text-center text-sm text-craftopa-textSecondary font-nunito tracking-wide">
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
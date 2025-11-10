// apps/mobile/src/screens/feed/CreatePost.tsx - FIXED: Using props only
import React, { useRef, useState } from 'react'
import { ScrollView, View, Text, TouchableOpacity, Modal } from 'react-native'
import { Input } from '~/components/common/TextInputField'
import Button from '~/components/common/Button'
import { ImageUploadPicker } from '~/components/common/ImageUploadPicker'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeft, ChevronDown, Check, Image as ImageIcon, Hash } from 'lucide-react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { FeedStackParamList } from '~/navigations/types'
import { postService } from '~/services/post.service'
import { useAlert } from '~/hooks/useAlert'

interface CreatePostFormData {
  title: string
  content: string
  imageUrl: string
  tags: string[]
  category: string
  featured: boolean
}

const CATEGORIES = [
  { id: 'Social', label: 'Social', icon: '👥', description: 'Connect with community' },
  { id: 'Tutorial', label: 'Tutorial', icon: '📚', description: 'Step-by-step guides' },
  { id: 'Challenge', label: 'Challenge', icon: '🏆', description: 'Eco challenges' },
  { id: 'Marketplace', label: 'Marketplace', icon: '🛒', description: 'Buy & sell items' },
  { id: 'Other', label: 'Other', icon: '📝', description: 'General posts' },
]

// ✅ Use screen props instead of hooks
type CreatePostScreenProps = NativeStackScreenProps<FeedStackParamList, 'Create'>;

export const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ navigation, route }) => {
  const onPostCreated = route.params?.onPostCreated

  const { success, error } = useAlert()
  const [loading, setLoading] = useState(false)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [tagsInput, setTagsInput] = useState('')
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState<CreatePostFormData>({
    title: '',
    content: '',
    imageUrl: '',
    tags: [],
    category: 'Other',
    featured: false,
  })

  const [errors, setErrors] = useState({
    title: '',
    content: '',
    category: '',
  })

  const refs = {
    content: useRef(null),
    title: useRef(null),
    tags: useRef(null),
  }

  const handleChange = (field: keyof CreatePostFormData, value: string | boolean) => {
    if (field === 'tags' && typeof value === 'string') {
      setTagsInput(value)
      const tagsArray = value.split(',').map(t => t.trim()).filter(Boolean)
      setFormData(prev => ({ ...prev, tags: tagsArray }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }

    if (field in errors) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleImageChange = (url?: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url || '' }))
  }

  const validateForm = (): boolean => {
    const newErrors = { title: '', content: '', category: '' }

    if (!formData.title.trim()) newErrors.title = 'Title is required'
    else if (formData.title.length > 255) newErrors.title = 'Title cannot exceed 255 characters'

    if (!formData.content.trim()) newErrors.content = 'Content is required'
    else if (formData.content.length > 1000) newErrors.content = 'Content cannot exceed 1000 characters'

    if (!formData.category || !CATEGORIES.find(cat => cat.id === formData.category)) {
      newErrors.category = 'Please select a valid category'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        imageUrl: formData.imageUrl.trim() || undefined,
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
        category: formData.category as 'Social' | 'Tutorial' | 'Challenge' | 'Marketplace' | 'Other',
        featured: formData.featured,
      }

      const response = await postService.createPost(payload)
      console.log('Post created:', response.data)

      onPostCreated?.()

      success('Post Created! 🎉', 'Your post has been shared successfully.', () => {
        navigation.goBack()
      })
    } catch (err: any) {
      console.error('Failed to create post:', err)
      error('Failed to Create Post', err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySelect = (categoryId: string) => {
    handleChange('category', categoryId)
    setShowCategoryPicker(false)
  }

  const getSelectedCategory = () => {
    return CATEGORIES.find(cat => cat.id === formData.category) || CATEGORIES[4]
  }

  const getTagsAsString = (): string => tagsInput
  const isFormValid = formData.title.trim() && formData.content.trim() && formData.category && !uploading

  const CharacterCounter = ({ current, max, warningThreshold = 0.9 }: { current: number; max: number; warningThreshold?: number }) => (
    <Text className={`text-xs font-nunito tracking-wide ${current > max * warningThreshold ? 'text-orange-500' : 'text-craftopa-textSecondary'}`}>
      {current}/{max}
    </Text>
  )

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['left', 'right']}>
      {/* Header */}
      <View className="px-5 py-4 border-b border-craftopa-light/10">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="w-9 h-9 items-center justify-center rounded-xl bg-craftopa-light/5 active:opacity-70 border border-craftopa-light/10 mr-3"
              activeOpacity={0.7}
            >
              <ArrowLeft size={18} color="#5A7160" />
            </TouchableOpacity>
            <View>
              <Text className="text-sm font-nunito text-craftopa-textSecondary tracking-wide mb-0.5">
                Create Post
              </Text>
              <Text className="text-xl font-poppinsBold text-craftopa-textPrimary tracking-tight">Share Your Story</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!isFormValid || loading}
            className={`px-5 py-2.5 rounded-xl flex-row items-center active:opacity-70 border ${
              isFormValid && !loading 
                ? 'bg-craftopa-primary border-craftopa-primary/20' 
                : 'bg-craftopa-light/10 border-craftopa-light/20'
            }`}
            activeOpacity={0.7}
          >
            <Text className={`font-poppinsBold text-sm tracking-tight ${
              isFormValid && !loading ? 'text-white' : 'text-craftopa-textSecondary'
            }`}>
              {loading ? 'Sharing...' : 'Share'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="p-5 space-y-6">
          {/* Title Input */}
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-poppinsBold text-craftopa-textPrimary tracking-tight">Title</Text>
              <CharacterCounter current={formData.title.length} max={255} />
            </View>
            <Input
              placeholder="What's your post about?"
              value={formData.title}
              onChangeText={value => handleChange('title', value)}
              ref={refs.title}
              nextInputRef={refs.content}
              error={errors.title}
              className="bg-white border-craftopa-light/10 rounded-2xl px-4 py-3 text-base font-nunito tracking-wide"
            />
          </View>

          {/* Content Input */}
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-poppinsBold text-craftopa-textPrimary tracking-tight">Content</Text>
              <CharacterCounter current={formData.content.length} max={1000} />
            </View>
            <Input
              placeholder="Share your thoughts, ideas, or story..."
              value={formData.content}
              onChangeText={value => handleChange('content', value)}
              ref={refs.content}
              nextInputRef={refs.tags}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              error={errors.content}
              className="bg-white border-craftopa-light/10 rounded-2xl px-4 py-3 text-base font-nunito tracking-wide min-h-[120px]"
            />
          </View>

          {/* Image Upload Section */}
          <View>
            <View className="flex-row items-center mb-3">
              <ImageIcon size={18} color="#5A7160" />
              <Text className="text-sm font-poppinsBold text-craftopa-textPrimary ml-2 tracking-tight">Image</Text>
            </View>
            <ImageUploadPicker
              description="Take a photo or choose from gallery"
              value={formData.imageUrl}
              onChange={handleImageChange}
              folder="posts"
              onUploadStart={() => setUploading(true)}
              onUploadComplete={() => setUploading(false)}
              disabled={loading}
            />
          </View>

          {/* Tags Input */}
          <View>
            <View className="flex-row items-center mb-3">
              <Hash size={18} color="#5A7160" />
              <Text className="text-sm font-poppinsBold text-craftopa-textPrimary ml-2 tracking-tight">Tags</Text>
            </View>
            <Input
              placeholder="craft, recycling, DIY..."
              value={getTagsAsString()}
              onChangeText={value => handleChange('tags', value)}
              ref={refs.tags}
              className="bg-white border-craftopa-light/10 rounded-2xl px-4 py-3 text-base font-nunito tracking-wide"
            />
            
            {/* Tag Preview */}
            {formData.tags.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mt-3">
                {formData.tags.map((tag, index) => (
                  <View key={index} className="bg-craftopa-primary/5 px-3 py-2 rounded-full flex-row items-center border border-craftopa-primary/10">
                    <Text className="text-craftopa-primary text-sm font-poppinsBold tracking-tight">#{tag}</Text>
                    <TouchableOpacity 
                      className="ml-2 active:opacity-70"
                      onPress={() => {
                        const newTags = formData.tags.filter((_, i) => i !== index)
                        const newTagsInput = newTags.join(', ')
                        setTagsInput(newTagsInput)
                        setFormData(prev => ({ ...prev, tags: newTags }))
                      }}
                      activeOpacity={0.7}
                    >
                      <Text className="text-craftopa-primary text-sm font-poppinsBold">×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Category Picker */}
          <View>
            <Text className="text-sm font-poppinsBold text-craftopa-textPrimary mb-3 tracking-tight">Category</Text>
            <TouchableOpacity
              onPress={() => setShowCategoryPicker(true)}
              className={`flex-row items-center justify-between p-4 border rounded-2xl active:opacity-70 ${
                errors.category ? 'border-red-300 bg-red-50' : 'border-craftopa-light/10 bg-white'
              }`}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Text className="text-xl mr-3">{getSelectedCategory().icon}</Text>
                <View>
                  <Text className="font-poppinsBold text-craftopa-textPrimary text-base tracking-tight">{getSelectedCategory().label}</Text>
                  <Text className="text-sm text-craftopa-textSecondary mt-0.5 font-nunito tracking-wide">{getSelectedCategory().description}</Text>
                </View>
              </View>
              <ChevronDown size={20} color="#5A7160" />
            </TouchableOpacity>
            {errors.category && (
              <Text className="text-red-500 text-sm mt-2 font-nunito tracking-wide">{errors.category}</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-5 max-h-[80%] shadow-xl">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-sm font-nunito text-craftopa-textSecondary tracking-wide mb-0.5">
                  Select Category
                </Text>
                <Text className="text-xl font-poppinsBold text-craftopa-textPrimary tracking-tight">Choose a Category</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowCategoryPicker(false)}
                className="w-9 h-9 items-center justify-center rounded-xl bg-craftopa-light/5 active:opacity-70 border border-craftopa-light/10"
                activeOpacity={0.7}
              >
                <Text className="text-craftopa-textSecondary font-poppinsBold">×</Text>
              </TouchableOpacity>
            </View>

            {/* Categories List */}
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="space-y-2">
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    className={`flex-row items-center justify-between p-4 rounded-2xl border active:opacity-70 ${
                      formData.category === category.id 
                        ? 'bg-craftopa-primary border-craftopa-primary/20' 
                        : 'bg-white border-craftopa-light/10'
                    }`}
                    onPress={() => handleCategorySelect(category.id)}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center flex-1">
                      <Text className={`text-xl mr-3 ${
                        formData.category === category.id ? 'text-white' : 'text-craftopa-textPrimary'
                      }`}>
                        {category.icon}
                      </Text>
                      <View className="flex-1">
                        <Text className={`font-poppinsBold text-base tracking-tight ${
                          formData.category === category.id ? 'text-white' : 'text-craftopa-textPrimary'
                        }`}>
                          {category.label}
                        </Text>
                        <Text className={`text-sm mt-0.5 font-nunito tracking-wide ${
                          formData.category === category.id ? 'text-white/80' : 'text-craftopa-textSecondary'
                        }`}>
                          {category.description}
                        </Text>
                      </View>
                    </View>
                    {formData.category === category.id && (
                      <Check size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
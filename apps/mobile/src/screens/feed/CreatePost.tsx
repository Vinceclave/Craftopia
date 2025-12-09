// apps/mobile/src/screens/feed/CreatePost.tsx - UPLOAD ONLY ON SUBMIT
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
import { useLocalUpload } from '~/hooks/useUpload'

interface CreatePostFormData {
  title: string
  content: string
  imageUri: string  // ✅ Store local URI, not URL
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

type CreatePostScreenProps = NativeStackScreenProps<FeedStackParamList, 'Create'>;

export const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ navigation, route }) => {
  const onPostCreated = route.params?.onPostCreated

  const { success, error } = useAlert()
  const { uploadToFolder } = useLocalUpload()  // ✅ Add upload hook
  const [loading, setLoading] = useState(false)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [tagsInput, setTagsInput] = useState(route.params?.initialTags?.join(', ') || '')

  const [formData, setFormData] = useState<CreatePostFormData>({
    title: route.params?.initialTitle || '',
    content: route.params?.initialContent || '',
    imageUri: route.params?.initialImageUri || '',  // ✅ Local URI
    tags: route.params?.initialTags || [],
    category: route.params?.initialCategory || 'Other',
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

  const handleImageChange = (uri?: string) => {
    setFormData(prev => ({ ...prev, imageUri: uri || '' }))
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
      let uploadedImageUrl: string | undefined = undefined

      // ✅ UPLOAD IMAGE ONLY ON SUBMIT
      if (formData.imageUri && formData.imageUri.startsWith('file://')) {
        console.log('📤 Uploading image to AWS...')
        const url = await uploadToFolder(formData.imageUri, 'posts')
        if (!url) {
          error('Upload Failed', 'Failed to upload image. Please try again.')
          setLoading(false)
          return
        }
        uploadedImageUrl = url
        console.log('✅ Image uploaded:', uploadedImageUrl)
      } else if (formData.imageUri) {
        // Already uploaded (e.g., from edit mode)
        uploadedImageUrl = formData.imageUri
      }

      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        imageUrl: uploadedImageUrl,
        tags: tagsInput.split(',').map((t: string) => t.trim()).filter(Boolean),
        category: formData.category as 'Social' | 'Tutorial' | 'Challenge' | 'Marketplace' | 'Other',
        featured: formData.featured,
      }

      console.log('📤 Creating post with payload:', payload)
      const response = await postService.createPost(payload)
      console.log('✅ Post created:', response.data)

      onPostCreated?.()

      success('Post Created! 🎉', 'Your post has been shared successfully.', () => {
        navigation.goBack()
      })
    } catch (err: any) {
      console.error('❌ Failed to create post:', err)
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
  const isFormValid = formData.title.trim() && formData.content.trim() && formData.category

  const CharacterCounter = ({ current, max, warningThreshold = 0.9 }: { current: number; max: number; warningThreshold?: number }) => (
    <Text className={`text-xs font-nunito ${current > max * warningThreshold ? 'text-craftopia-warning' : 'text-craftopia-textSecondary'}`}>
      {current}/{max}
    </Text>
  )

  return (
    <SafeAreaView className="flex-1 bg-craftopia-surface" edges={['left', 'right']}>
      {/* Header */}
      <View className="px-4 py-3 border-b border-craftopia-light">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-8 h-8 items-center justify-center rounded-lg bg-craftopia-light active:opacity-70 mr-2"
              activeOpacity={0.7}
            >
              <ArrowLeft size={16} color="#3B6E4D" />
            </TouchableOpacity>
            <View>
              <Text className="text-sm font-nunito text-craftopia-textSecondary mb-0.5">
                Create Post
              </Text>
              <Text className="text-lg font-poppinsBold text-craftopia-textPrimary">Share Your Story</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!isFormValid || loading}
            className={`px-4 py-2 rounded-lg flex-row items-center active:opacity-70 border ${isFormValid && !loading
              ? 'bg-craftopia-primary border-craftopia-primary'
              : 'bg-craftopia-light border-craftopia-light'
              }`}
            activeOpacity={0.7}
          >
            <Text className={`font-poppinsBold text-sm ${isFormValid && !loading ? 'text-white' : 'text-craftopia-textSecondary'
              }`}>
              {loading ? 'Sharing...' : 'Share'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        <View className="p-4 space-y-4">
          {/* Title Input */}
          <View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-poppinsBold text-craftopia-textPrimary">Title</Text>
              <CharacterCounter current={formData.title.length} max={255} />
            </View>
            <Input
              placeholder="What's your post about?"
              value={formData.title}
              onChangeText={value => handleChange('title', value)}
              ref={refs.title}
              nextInputRef={refs.content}
              error={errors.title}
              className="bg-craftopia-surface border-craftopia-light rounded-xl px-3 py-2.5 text-sm font-nunito"
            />
          </View>

          {/* Content Input */}
          <View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-poppinsBold text-craftopia-textPrimary">Content</Text>
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
              className="bg-craftopia-surface border-craftopia-light rounded-xl px-3 py-2.5 text-sm font-nunito min-h-[120px]"
            />
          </View>

          {/* Image Upload Section */}
          <View>
            <View className="flex-row items-center mb-2">
              <ImageIcon size={16} color="#3B6E4D" />
              <Text className="text-sm font-poppinsBold text-craftopia-textPrimary ml-1.5">Image (Optional)</Text>
            </View>
            <ImageUploadPicker
              description="Take a photo or choose from gallery"
              value={formData.imageUri}
              onChange={handleImageChange}
              disabled={loading}
            />
            {formData.imageUri && formData.imageUri.startsWith('file://') && (
              <Text className="text-xs text-craftopia-textSecondary mt-1 font-nunito">
                💡 Image will be uploaded when you submit
              </Text>
            )}
          </View>

          {/* Tags Input */}
          <View>
            <View className="flex-row items-center mb-2">
              <Hash size={16} color="#3B6E4D" />
              <Text className="text-sm font-poppinsBold text-craftopia-textPrimary ml-1.5">Tags</Text>
            </View>
            <Input
              placeholder="craft, recycling, DIY..."
              value={getTagsAsString()}
              onChangeText={value => handleChange('tags', value)}
              ref={refs.tags}
              className="bg-craftopia-surface border-craftopia-light rounded-xl px-3 py-2.5 text-sm font-nunito"
            />

            {/* Tag Preview */}
            {formData.tags.length > 0 && (
              <View className="flex-row flex-wrap gap-1.5 mt-2">
                {formData.tags.map((tag, index) => (
                  <View key={index} className="bg-craftopia-primary/5 px-2.5 py-1 rounded-full flex-row items-center border border-craftopia-primary/20">
                    <Text className="text-craftopia-primary text-xs font-poppinsBold">#{tag}</Text>
                    <TouchableOpacity
                      className="ml-1 active:opacity-70"
                      onPress={() => {
                        const newTags = formData.tags.filter((_, i) => i !== index)
                        const newTagsInput = newTags.join(', ')
                        setTagsInput(newTagsInput)
                        setFormData(prev => ({ ...prev, tags: newTags }))
                      }}
                      activeOpacity={0.7}
                    >
                      <Text className="text-craftopia-primary text-xs font-poppinsBold">×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Category Picker */}
          <View>
            <Text className="text-sm font-poppinsBold text-craftopia-textPrimary mb-2">Category</Text>
            <TouchableOpacity
              onPress={() => setShowCategoryPicker(true)}
              className={`flex-row items-center justify-between p-3 border rounded-lg active:opacity-70 ${errors.category ? 'border-craftopia-error bg-craftopia-error/10' : 'border-craftopia-light bg-craftopia-surface'
                }`}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Text className="text-xl mr-2">{getSelectedCategory().icon}</Text>
                <View>
                  <Text className="font-poppinsBold text-craftopia-textPrimary text-sm">{getSelectedCategory().label}</Text>
                  <Text className="text-xs text-craftopia-textSecondary mt-0.5 font-nunito">{getSelectedCategory().description}</Text>
                </View>
              </View>
              <ChevronDown size={18} color="#3B6E4D" />
            </TouchableOpacity>
            {errors.category && (
              <Text className="text-craftopia-error text-xs mt-1 font-nunito">{errors.category}</Text>
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
          <View className="bg-craftopia-surface rounded-t-xl p-4 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="text-sm font-nunito text-craftopia-textSecondary mb-0.5">
                  Select Category
                </Text>
                <Text className="text-lg font-poppinsBold text-craftopia-textPrimary">Choose a Category</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCategoryPicker(false)}
                className="w-8 h-8 items-center justify-center rounded-lg bg-craftopia-light active:opacity-70"
                activeOpacity={0.7}
              >
                <Text className="text-craftopia-textSecondary font-poppinsBold">×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="space-y-1.5">
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    className={`flex-row items-center justify-between p-3 rounded-lg border active:opacity-70 ${formData.category === category.id
                      ? 'bg-craftopia-primary border-craftopia-primary'
                      : 'bg-craftopia-surface border-craftopia-light'
                      }`}
                    onPress={() => handleCategorySelect(category.id)}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center flex-1">
                      <Text className={`text-xl mr-2 ${formData.category === category.id ? 'text-white' : 'text-craftopia-textPrimary'
                        }`}>
                        {category.icon}
                      </Text>
                      <View className="flex-1">
                        <Text className={`font-poppinsBold text-sm ${formData.category === category.id ? 'text-white' : 'text-craftopia-textPrimary'
                          }`}>
                          {category.label}
                        </Text>
                        <Text className={`text-xs mt-0.5 font-nunito ${formData.category === category.id ? 'text-white/80' : 'text-craftopia-textSecondary'
                          }`}>
                          {category.description}
                        </Text>
                      </View>
                    </View>
                    {formData.category === category.id && (
                      <Check size={18} color="#FFFFFF" />
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
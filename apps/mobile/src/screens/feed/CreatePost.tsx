import React, { useRef, useState } from 'react'
import { ScrollView, View, Text, TouchableOpacity, Image, Alert, Modal } from 'react-native'
import { Input } from '~/components/common/TextInputField'
import Button from '~/components/common/Button'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image as ImageIcon, X, ArrowLeft, Camera, ImageIcon as Gallery, ChevronDown, Check } from 'lucide-react-native'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { postService } from '~/services/post.service'
import { useAlert } from '~/hooks/useAlert'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { FeedStackParamList } from '~/navigations/types'

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

type CreatePostNavigationProp = NativeStackNavigationProp<FeedStackParamList, 'Create'>
type CreatePostRouteProp = RouteProp<FeedStackParamList, 'Create'>

export const CreatePostScreen = () => {
  const navigation = useNavigation<CreatePostNavigationProp>()
  const route = useRoute<CreatePostRouteProp>()
  const onPostCreated = route.params?.onPostCreated

  const { success, error } = useAlert()
  const [loading, setLoading] = useState(false)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [tagsInput, setTagsInput] = useState('')

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
    category: useRef(null),
    image: useRef(null),
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

  const handleImageUpload = (type: 'camera' | 'gallery' | 'url') => {
    setShowImagePicker(false)
    
    switch (type) {
      case 'camera':
        Alert.alert('Camera', 'Camera functionality coming soon! For now, use image URL.')
        break
      case 'gallery':
        Alert.alert('Gallery', 'Gallery picker coming soon! For now, use image URL.')
        break
      case 'url':
        refs.image.current?.focus()
        break
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

  return (
    <SafeAreaView className="flex-1 bg-craftopia-light" edges={['left', 'right']}>
      {/* Header */}
      <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light flex-row justify-between items-center">
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-2 p-1" onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="#1A1A1A" />
          </TouchableOpacity>
          <Text className="text-base font-semibold text-craftopia-textPrimary">Create Post</Text>
        </View>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!isFormValid || loading}
          className={`px-3 py-1.5 rounded-full ${isFormValid && !loading ? 'bg-craftopia-primary' : 'bg-craftopia-light'}`}
        >
          <Text className={`text-sm font-medium ${isFormValid && !loading ? 'text-white' : 'text-craftopia-textSecondary'}`}>
            {loading ? 'Sharing...' : 'Share'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Main Content Card */}
        <View className="bg-craftopia-surface mx-4 mt-4 rounded-xl border border-craftopia-light p-4">
          {/* Title Input */}
          <Input
            label="Title"
            placeholder="What's your post about?"
            value={formData.title}
            onChangeText={value => handleChange('title', value)}
            ref={refs.title}
            nextInputRef={refs.content}
            containerClassName="mb-0"
            error={errors.title}
          />

          {/* Content Input */}
          <Input
            label="Content"
            placeholder="Share your thoughts, ideas, or story..."
            value={formData.content}
            onChangeText={value => handleChange('content', value)}
            ref={refs.content}
            nextInputRef={refs.image}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            error={errors.content}
            containerClassName="mt-3 mb-3"
          />

          {/* Image Section */}
          <View className="mb-3">
            <Text className="text-craftopia-textSecondary text-sm mb-2 font-medium">Image</Text>
            
            {formData.imageUrl ? (
              <View className="relative">
                <Image 
                  source={{ uri: formData.imageUrl }} 
                  className="w-full h-40 rounded-lg"
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5"
                  onPress={() => handleChange('imageUrl', '')}
                >
                  <X size={14} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                className="bg-craftopia-light border-2 border-dashed border-craftopia-light rounded-lg p-6 items-center"
                activeOpacity={0.8}
                onPress={() => setShowImagePicker(true)}
              >
                <View className="w-10 h-10 bg-craftopia-primary/10 rounded-full items-center justify-center mb-2">
                  <ImageIcon size={20} color="#004E98" />
                </View>
                <Text className="text-craftopia-textPrimary font-medium mb-0.5">Add Photo</Text>
                <Text className="text-craftopia-textSecondary text-xs text-center">
                  Tap to upload from camera, gallery, or URL
                </Text>
              </TouchableOpacity>
            )}

            {/* Image URL Input */}
            <Input
              label="Or paste image URL"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl}
              onChangeText={value => handleChange('imageUrl', value)}
              ref={refs.image}
              nextInputRef={refs.tags}
              containerClassName="mt-2 mb-0"
            />
          </View>

          {/* Tags Input */}
          <View className="mb-3">
            <Input
              label="Tags"
              placeholder="craft, recycling, DIY (comma separated)"
              value={getTagsAsString()}
              onChangeText={value => handleChange('tags', value)}
              ref={refs.tags}
              containerClassName="mb-2"
            />
            
            {/* Tag Preview */}
            {formData.tags.length > 0 && (
              <View className="flex-row flex-wrap gap-1.5 mt-2">
                {formData.tags.map((tag, index) => (
                  <View key={index} className="bg-craftopia-primary/10 px-2.5 py-1 rounded-full flex-row items-center">
                    <Text className="text-craftopia-primary text-xs font-medium">#{tag}</Text>
                    <TouchableOpacity 
                      className="ml-1"
                      onPress={() => {
                        const newTags = formData.tags.filter((_, i) => i !== index)
                        const newTagsInput = newTags.join(', ')
                        setTagsInput(newTagsInput)
                        setFormData(prev => ({ ...prev, tags: newTags }))
                      }}
                    >
                      <X size={12} color="#004E98" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Category Picker */}
          <View className="mb-4">
            <Text className="text-craftopia-textSecondary text-sm mb-2 font-medium">Category</Text>
            <TouchableOpacity
              onPress={() => setShowCategoryPicker(true)}
              className={`flex-row items-center justify-between p-3 border rounded-lg ${
                errors.category ? 'border-red-400 bg-red-50' : 'border-craftopia-light bg-craftopia-light'
              }`}
            >
              <View className="flex-row items-center">
                <Text className="text-xl mr-2">{getSelectedCategory().icon}</Text>
                <View>
                  <Text className="font-medium text-craftopia-textPrimary">{getSelectedCategory().label}</Text>
                  <Text className="text-xs text-craftopia-textSecondary">{getSelectedCategory().description}</Text>
                </View>
              </View>
              <ChevronDown size={16} color="#6B7280" />
            </TouchableOpacity>
            {errors.category && (
              <Text className="text-red-500 text-xs mt-1">{errors.category}</Text>
            )}
          </View>

          {/* Submit Button */}
          <Button 
            title={loading ? 'Creating Post...' : 'Create Post'} 
            onPress={handleSubmit} 
            loading={loading} 
            disabled={!isFormValid || loading} 
            size="md"
          />
        </View>
      </ScrollView>

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-craftopia-surface rounded-t-xl p-4">
            <View className="w-8 h-0.5 bg-craftopia-light rounded-full self-center mb-4" />
            <Text className="text-base font-semibold text-craftopia-textPrimary mb-4 text-center">Add Photo</Text>
            
            <View className="space-y-2">
              <TouchableOpacity 
                className="flex-row items-center p-3 bg-craftopia-light rounded-lg"
                onPress={() => handleImageUpload('camera')}
              >
                <View className="w-10 h-10 bg-craftopia-primary/10 rounded-full items-center justify-center mr-3">
                  <Camera size={16} color="#004E98" />
                </View>
                <View>
                  <Text className="font-medium text-craftopia-textPrimary">Take Photo</Text>
                  <Text className="text-xs text-craftopia-textSecondary">Use camera to capture</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-row items-center p-3 bg-craftopia-light rounded-lg"
                onPress={() => handleImageUpload('gallery')}
              >
                <View className="w-10 h-10 bg-craftopia-primary/10 rounded-full items-center justify-center mr-3">
                  <Gallery size={16} color="#004E98" />
                </View>
                <View>
                  <Text className="font-medium text-craftopia-textPrimary">Choose from Gallery</Text>
                  <Text className="text-xs text-craftopia-textSecondary">Select from your photos</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-row items-center p-3 bg-craftopia-light rounded-lg"
                onPress={() => handleImageUpload('url')}
              >
                <View className="w-10 h-10 bg-craftopia-primary/10 rounded-full items-center justify-center mr-3">
                  <ImageIcon size={16} color="#004E98" />
                </View>
                <View>
                  <Text className="font-medium text-craftopia-textPrimary">Paste URL</Text>
                  <Text className="text-xs text-craftopia-textSecondary">Add image from web</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              className="mt-4 p-3 bg-craftopia-light rounded-lg"
              onPress={() => setShowImagePicker(false)}
            >
              <Text className="text-center font-medium text-craftopia-textSecondary">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-craftopia-surface rounded-t-xl p-4">
            <View className="w-8 h-0.5 bg-craftopia-light rounded-full self-center mb-4" />
            <Text className="text-base font-semibold text-craftopia-textPrimary mb-4 text-center">Select Category</Text>
            
            <View className="space-y-1.5">
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  className={`flex-row items-center justify-between p-3 rounded-lg ${
                    formData.category === category.id ? 'bg-craftopia-primary/10 border border-craftopia-primary/20' : 'bg-craftopia-light'
                  }`}
                  onPress={() => handleCategorySelect(category.id)}
                >
                  <View className="flex-row items-center">
                    <Text className="text-xl mr-3">{category.icon}</Text>
                    <View>
                      <Text className={`font-medium ${
                        formData.category === category.id ? 'text-craftopia-primary' : 'text-craftopia-textPrimary'
                      }`}>
                        {category.label}
                      </Text>
                      <Text className={`text-xs ${
                        formData.category === category.id ? 'text-craftopia-primary' : 'text-craftopia-textSecondary'
                      }`}>
                        {category.description}
                      </Text>
                    </View>
                  </View>
                  {formData.category === category.id && (
                    <Check size={16} color="#004E98" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              className="mt-4 p-3 bg-craftopia-light rounded-lg"
              onPress={() => setShowCategoryPicker(false)}
            >
              <Text className="text-center font-medium text-craftopia-textSecondary">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
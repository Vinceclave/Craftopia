// ENHANCED: apps/mobile/src/screens/feed/CreatePost.tsx
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
      // Store the raw input for display
      setTagsInput(value)
      // Only split into array when there's actual content after commas
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
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean), // Parse tags from raw input
        category: formData.category as 'Social' | 'Tutorial' | 'Challenge' | 'Marketplace' | 'Other',
        featured: formData.featured,
      }

      const response = await postService.createPost(payload)
      console.log('Post created:', response.data)

      // Trigger callback in FeedScreen
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
        // Focus on the image URL input
        refs.image.current?.focus()
        break
    }
  }

  const handleCategorySelect = (categoryId: string) => {
    handleChange('category', categoryId)
    setShowCategoryPicker(false)
  }

  const getSelectedCategory = () => {
    return CATEGORIES.find(cat => cat.id === formData.category) || CATEGORIES[4] // Default to Other
  }

  const getTagsAsString = (): string => tagsInput
  const isFormValid = formData.title.trim() && formData.content.trim() && formData.category

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-100 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-3 p-1" onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Create Post</Text>
        </View>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!isFormValid || loading}
          className={`px-4 py-2 rounded-full ${isFormValid && !loading ? 'bg-blue-500' : 'bg-gray-300'}`}
        >
          <Text className={`font-semibold ${isFormValid && !loading ? 'text-white' : 'text-gray-500'}`}>
            {loading ? 'Sharing...' : 'Share'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Main Content Card */}
        <View className="bg-white mx-4 mt-4 rounded-2xl shadow-sm border border-gray-100 p-4">
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
            containerClassName="mt-4 mb-4"
          />

          {/* Image Section */}
          <View className="mb-4">
            <Text className="text-gray-600 text-sm mb-2 font-medium">Image</Text>
            
            {formData.imageUrl ? (
              <View className="relative">
                <Image 
                  source={{ uri: formData.imageUrl }} 
                  className="w-full h-48 rounded-xl"
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  className="absolute top-2 right-2 bg-black/60 rounded-full p-2"
                  onPress={() => handleChange('imageUrl', '')}
                >
                  <X size={16} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 items-center"
                activeOpacity={0.7}
                onPress={() => setShowImagePicker(true)}
              >
                <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-3">
                  <ImageIcon size={24} color="#3B82F6" />
                </View>
                <Text className="text-gray-700 font-medium mb-1">Add Photo</Text>
                <Text className="text-gray-500 text-sm text-center">
                  Tap to upload from camera, gallery, or URL
                </Text>
              </TouchableOpacity>
            )}

            {/* Image URL Input (always visible) */}
            <Input
              label="Or paste image URL"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl}
              onChangeText={value => handleChange('imageUrl', value)}
              ref={refs.image}
              nextInputRef={refs.tags}
              containerClassName="mt-3 mb-0"
            />
          </View>

          {/* Tags Input with Visual Preview */}
          <View className="mb-4">
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
              <View className="flex-row flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <View key={index} className="bg-blue-100 px-3 py-1 rounded-full flex-row items-center">
                    <Text className="text-blue-800 text-sm font-medium">#{tag}</Text>
                    <TouchableOpacity 
                      className="ml-1"
                      onPress={() => {
                        const newTags = formData.tags.filter((_, i) => i !== index)
                        const newTagsInput = newTags.join(', ')
                        setTagsInput(newTagsInput)
                        setFormData(prev => ({ ...prev, tags: newTags }))
                      }}
                    >
                      <X size={14} color="#1E40AF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Category Picker */}
          <View className="mb-4">
            <Text className="text-gray-600 text-sm mb-2 font-medium">Category</Text>
            <TouchableOpacity
              onPress={() => setShowCategoryPicker(true)}
              className={`flex-row items-center justify-between p-4 border rounded-xl ${
                errors.category ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">{getSelectedCategory().icon}</Text>
                <View>
                  <Text className="font-medium text-gray-900">{getSelectedCategory().label}</Text>
                  <Text className="text-sm text-gray-500">{getSelectedCategory().description}</Text>
                </View>
              </View>
              <ChevronDown size={20} color="#6B7280" />
            </TouchableOpacity>
            {errors.category && (
              <Text className="text-red-500 text-sm mt-1">{errors.category}</Text>
            )}
          </View>

          {/* Submit Button */}
          <Button 
            title={loading ? 'Creating Post...' : 'Create Post'} 
            onPress={handleSubmit} 
            loading={loading} 
            disabled={!isFormValid || loading} 
            size="lg" 
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
          <View className="bg-white rounded-t-3xl p-6">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />
            <Text className="text-xl font-bold text-gray-900 mb-6 text-center">Add Photo</Text>
            
            <View className="space-y-3">
              <TouchableOpacity 
                className="flex-row items-center p-4 bg-blue-50 rounded-xl"
                onPress={() => handleImageUpload('camera')}
              >
                <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
                  <Camera size={20} color="#3B82F6" />
                </View>
                <View>
                  <Text className="font-semibold text-gray-900">Take Photo</Text>
                  <Text className="text-sm text-gray-500">Use camera to capture</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-row items-center p-4 bg-green-50 rounded-xl"
                onPress={() => handleImageUpload('gallery')}
              >
                <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mr-4">
                  <Gallery size={20} color="#10B981" />
                </View>
                <View>
                  <Text className="font-semibold text-gray-900">Choose from Gallery</Text>
                  <Text className="text-sm text-gray-500">Select from your photos</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-row items-center p-4 bg-purple-50 rounded-xl"
                onPress={() => handleImageUpload('url')}
              >
                <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mr-4">
                  <ImageIcon size={20} color="#8B5CF6" />
                </View>
                <View>
                  <Text className="font-semibold text-gray-900">Paste URL</Text>
                  <Text className="text-sm text-gray-500">Add image from web</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              className="mt-6 p-4 bg-gray-100 rounded-xl"
              onPress={() => setShowImagePicker(false)}
            >
              <Text className="text-center font-semibold text-gray-700">Cancel</Text>
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
          <View className="bg-white rounded-t-3xl p-6">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />
            <Text className="text-xl font-bold text-gray-900 mb-6 text-center">Select Category</Text>
            
            <View className="space-y-2">
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  className={`flex-row items-center justify-between p-4 rounded-xl ${
                    formData.category === category.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}
                  onPress={() => handleCategorySelect(category.id)}
                >
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-4">{category.icon}</Text>
                    <View>
                      <Text className={`font-semibold ${
                        formData.category === category.id ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {category.label}
                      </Text>
                      <Text className={`text-sm ${
                        formData.category === category.id ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {category.description}
                      </Text>
                    </View>
                  </View>
                  {formData.category === category.id && (
                    <Check size={20} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              className="mt-6 p-4 bg-gray-100 rounded-xl"
              onPress={() => setShowCategoryPicker(false)}
            >
              <Text className="text-center font-semibold text-gray-700">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
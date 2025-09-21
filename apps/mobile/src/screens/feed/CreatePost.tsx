import React, { useRef, useState } from 'react'
import { ScrollView, View, Text, TouchableOpacity, Image } from 'react-native'
import { Input } from '~/components/common/TextInputField'
import Button from '~/components/common/Button'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image as ImageIcon, X, ArrowLeft } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import { postService } from '~/services/post.service'

interface CreatePostProps {
  title: string
  content: string
  imageUrl?: string | null
  tags: string[]
  category: string
}

export const CreatePostScreen = () => {
  const navigate = useNavigation()

  const [formData, setFormData] = useState<CreatePostProps>({
    title: '',
    content: '',
    imageUrl: 'https://example.com/image.png',
    tags: [],
    category: '',
  })

  const refs = {
    content: useRef(null),
    title: useRef(null),
    tags: useRef(null),
    category: useRef(null),
    image: useRef(null),
  }

  const handleChange = (field: keyof CreatePostProps, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'tags' 
        ? value.split(',').map(t => t.trim()).filter(Boolean) 
        : value,
    }))
  }

  const handleSubmit = async () => {
    // Prepare payload for backend
    const payload: CreatePostProps = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      imageUrl: formData.imageUrl?.trim() || null, // convert empty string to null
      tags: formData.tags.map(tag => tag.trim()).filter(Boolean),
      category: formData.category.trim() || 'Other', // default to 'Other' if empty
    }

    try {
      const res = await postService.createPost(payload)
      console.log('Post created:', res.data)
      // Optionally reset form or navigate back
      navigate.goBack()
    } catch (err) {
      console.error('Failed to create post:', err)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity 
              className="mr-3 p-1"
              onPress={() => navigate.goBack()}
            >
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">Create Post</Text>
          </View>
          <TouchableOpacity 
            onPress={handleSubmit}
            className="bg-blue-500 px-4 py-2 rounded-full"
          >
            <Text className="text-white font-semibold">Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Main Post Content */}
        <View className="bg-white mx-4 mt-4 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Content Input */}
          <View className="p-4">
            <Input
              placeholder="What's on your mind?"
              value={formData.content}
              onChangeText={value => handleChange('content', value)}
              ref={refs.content}
              nextInputRef={refs.title}
              containerClassName="mb-0"
              style={{ fontSize: 16, lineHeight: 22 }}
            />
          </View>

          {/* Image Section */}
          {formData.imageUrl ? (
            <View className="relative">
              <Image 
                source={{ uri: formData.imageUrl }} 
                className="w-full h-64"
                resizeMode="cover"
              />
              <TouchableOpacity 
                className="absolute top-3 right-3 bg-black/50 rounded-full p-2"
                onPress={() => handleChange('imageUrl', '')}
              >
                <X size={18} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              className="mx-4 mb-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 items-center"
              activeOpacity={0.7}
              onPress={() => {
                // TODO: Add image picker if desired
              }}
            >
              <ImageIcon size={32} color="#9CA3AF" />
              <Text className="text-gray-500 mt-2 font-medium">Add Photo</Text>
            </TouchableOpacity>
          )}

          {/* Image URL Input */}
          <View className="px-4 pb-4">
            <Input
              placeholder="Paste image URL (optional)"
              value={formData.imageUrl || ''}
              onChangeText={value => handleChange('imageUrl', value)}
              ref={refs.image}
              nextInputRef={refs.title}
              containerClassName="mb-0"
            />
          </View>
        </View>

        {/* Post Details */}
        <View className="bg-white mx-4 mt-4 rounded-2xl shadow-sm border border-gray-100 p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Post Details</Text>
          
          <Input
            label="Title"
            placeholder="Give your post a catchy title"
            value={formData.title}
            onChangeText={value => handleChange('title', value)}
            ref={refs.title}
            nextInputRef={refs.tags}
            containerClassName="mb-3"
          />

          <Input
            label="Tags"
            placeholder="#nature #photography #sunset"
            value={formData.tags.join(', ')}
            onChangeText={value => handleChange('tags', value)}
            ref={refs.tags}
            nextInputRef={refs.category}
            containerClassName="mb-3"
          />

          <Input
            label="Category"
            placeholder="Select or enter category"
            value={formData.category}
            onChangeText={value => handleChange('category', value)}
            ref={refs.category}
            isLastInput
            onSubmit={handleSubmit}
            containerClassName="mb-0"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

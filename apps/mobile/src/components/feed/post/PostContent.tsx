import React, { memo } from 'react'
import { View, Text, Image } from 'react-native'

interface PostContentProps {
  title: string
  content: string
  image_url?: string
  tags?: string[]
}

export const PostContent: React.FC<PostContentProps> = memo(({ title, content, image_url, tags = [] }) => (
  <View className="mb-3">
    <Text className="font-medium text-gray-900 mb-1">{title}</Text>
    <Text className="text-gray-600 text-sm leading-5 mb-2">{content}</Text>

    {image_url && (
      <Image source={{ uri: image_url }} className="w-full h-48 rounded-lg mb-3" style={{ resizeMode: 'cover' }} />
    )}

    {tags.length > 0 && (
      <View className="flex-row mb-3">
        {tags.slice(0, 3).map((tag, idx) => (
          <Text key={tag + idx} className="text-xs text-gray-500 mr-3">#{tag}</Text>
        ))}
      </View>
    )}
  </View>
))

import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { Heart, MessageCircle, Share2 } from 'lucide-react-native'

export interface PostProps {
  post_id: number
  user_id: number
  title: string
  content: string
  image_url: string
  category: string
  tags: string[]
  featured: boolean
  commentCount: number
  likeCount: number
  isLiked?: boolean
  created_at: string
  updated_at: string
  deleted_at?: string | null
  user: {
    user_id: number
    username: string
  }
  onToggleReaction?: () => void // ✅ new prop
}

export const Post: React.FC<PostProps> = ({
  title,
  content,
  image_url,
  tags,
  featured,
  commentCount,
  likeCount,
  isLiked,
  user,
  created_at,
  onToggleReaction, // ✅ receive callback
}) => {
  return (
    <View className="bg-white border-b border-gray-100 pb-4 mb-4">
      {/* Post Header */}
      <View className="flex-row items-center mb-3">
        <Image
          source={{ uri: `https://i.pravatar.cc/32?u=${user.user_id}` }}
          className="w-8 h-8 rounded-full"
        />
        <View className="flex-1 ml-2">
          <Text className="font-medium text-gray-900 text-sm">{user.username}</Text>
          <Text className="text-xs text-gray-500">2h ago</Text>
        </View>
        {featured && <View className="w-2 h-2 bg-blue-500 rounded-full" />}
      </View>

      {/* Post Content */}
      <View className="mb-3">
        <Text className="font-medium text-gray-900 mb-1">{title}</Text>
        <Text className="text-gray-600 text-sm leading-5">{content}</Text>
      </View>

      {/* Post Image */}
      {image_url && (
        <Image
          source={{ uri: image_url }}
          className="w-full h-48 rounded-lg mb-3"
          style={{ resizeMode: 'cover' }}
        />
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <View className="flex-row mb-3">
          {tags.slice(0, 3).map((tag, idx) => (
            <Text key={tag + idx} className="text-xs text-gray-500 mr-3">
              #{tag}
            </Text>
          ))}
        </View>
      )}

      {/* Post Actions */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row space-x-6">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={onToggleReaction} // ✅ call toggle handler
          >
            <Heart
              size={18}
              color={isLiked ? '#EF4444' : '#9CA3AF'}
              fill={isLiked ? '#EF4444' : 'none'}
            />
            <Text className="text-sm text-gray-500 ml-1">{likeCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center">
            <MessageCircle size={18} color="#9CA3AF" />
            <Text className="text-sm text-gray-500 ml-1">{commentCount}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Share2 size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

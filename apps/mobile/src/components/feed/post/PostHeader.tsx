import React, { memo } from 'react'
import { View, Text, Image } from 'react-native'
import type { User } from './type'

interface PostHeaderProps {
  user: User
  featured?: boolean
  timeAgo?: string
}

export const PostHeader: React.FC<PostHeaderProps> = memo(({ user, featured, timeAgo }) => (
  <View className="flex-row items-center mb-3">
    <Image 
      source={{ uri: `https://i.pravatar.cc/32?u=${user.user_id}` }} 
      className="w-8 h-8 rounded-full" 
    />
    <View className="flex-1 ml-2">
      <Text className="font-medium text-gray-900 text-sm">{user.username}</Text>
      <Text className="text-xs text-gray-500">{timeAgo || '2h ago'}</Text>
    </View>
    {featured && <View className="w-2 h-2 bg-blue-500 rounded-full" />}
  </View>
))


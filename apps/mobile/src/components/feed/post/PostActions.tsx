import React, { memo } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Heart, MessageCircle, Share2 } from 'lucide-react-native'

interface PostActionsProps {
  likeCount: number
  commentCount: number
  isLiked?: boolean
  onToggleReaction?: () => void
  onOpenComments?: () => void
}

export const PostActions: React.FC<PostActionsProps> = memo(
  ({ likeCount, commentCount, isLiked, onToggleReaction, onOpenComments }) => (
    <View className="flex-row items-center justify-between">
      <View className="flex-row space-x-6">
        <TouchableOpacity className="flex-row items-center" onPress={onToggleReaction}>
          <Heart size={18} color={isLiked ? '#EF4444' : '#9CA3AF'} fill={isLiked ? '#EF4444' : 'none'} />
          <Text className="text-sm text-gray-500 ml-1">{likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center" onPress={onOpenComments}>
          <MessageCircle size={18} color="#9CA3AF" />
          <Text className="text-sm text-gray-500 ml-1">{commentCount}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity>
        <Share2 size={18} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  )
)

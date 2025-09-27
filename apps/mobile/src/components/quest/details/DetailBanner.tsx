import { Award, Star, Users } from 'lucide-react-native'
import React from 'react'
import { Text, View } from 'react-native'
import Button from '~/components/common/Button'

interface DetailBannerProp {
  participants: number
  category: string
  title: string
  description: string
  points: number
  isLoading?: boolean
  isJoined: boolean
  onPress: () => void
}

export const DetailBanner: React.FC<DetailBannerProp> = ({ 
  participants,
  category, 
  title, 
  description, 
  points, 
  isLoading = false,
  isJoined,
  onPress
}) => {
  if (isLoading) {
    return (
      <View className="bg-craftopia-surface px-4 py-4 border-b border-craftopia-light">
        <View className="h-4 bg-craftopia-light rounded mb-2 w-16" />
        <View className="h-5 bg-craftopia-light rounded mb-2 w-3/4" />
        <View className="h-3 bg-craftopia-light rounded mb-2 w-full" />
        <View className="h-3 bg-craftopia-light rounded mb-2 w-2/3" />
        <View className="flex-row gap-2">
          <View className="h-5 bg-craftopia-light rounded-full w-20" />
          <View className="h-5 bg-craftopia-light rounded-full w-14" />
        </View>
      </View>
    )
  }

  return (
    <View className="bg-craftopia-surface px-4 py-4 border-b border-craftopia-light">
      <View className="bg-craftopia-primary/10 px-3 py-1.5 rounded-full self-start mb-3">
        <Text className="text-craftopia-primary text-xs font-medium">{category}</Text>
      </View>

      <Text className="text-base font-semibold text-craftopia-textPrimary mb-2">{title}</Text>
      <Text className="text-sm text-craftopia-textSecondary leading-5 mb-3">{description}</Text>

      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View className="bg-craftopia-primary/10 px-2 py-1 rounded-full flex-row items-center">
            <Award size={12} className="text-craftopia-primary" />
            <Text className="text-craftopia-primary text-xs font-medium ml-1">{points} Points</Text>
          </View>

          <View className="bg-craftopia-primary/10 px-2 py-1 rounded-full flex-row items-center">
            <Star size={12} className="text-craftopia-accent" />
            <Text className="text-craftopia-primary text-xs font-medium ml-1">4.8</Text>
          </View>
        </View>
        
        <View className="flex-row items-center">
          <Users size={12} className="text-craftopia-textSecondary" />
          <Text className="text-craftopia-textSecondary text-xs ml-1">{participants}</Text>
        </View>
      </View>
      
      <View className="mt-3 pt-3 border-t border-craftopia-light">
        <Button
          onPress={onPress}
          title={!isJoined ? 'Start Quest' : 'Joined'}
          size="md"
          loading={isLoading}
          disabled={isJoined}
        />
      </View>
    </View>
  )
}
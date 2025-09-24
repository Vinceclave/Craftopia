import { Award, Star } from 'lucide-react-native'
import React from 'react'
import { Text, View } from 'react-native'
import Button from '~/components/common/Button'

interface DetailBannerProp {
  category: string
  title: string
  description: string
  points: number
  isLoading?: boolean
  isJoined: boolean
  onPress: () => void
}

export const DetailBanner: React.FC<DetailBannerProp> = ({ 
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
      <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light">
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
      <View className="bg-craftopia-primary/10 px-2 py-1 rounded-full self-start mb-2">
        <Text className="text-craftopia-primary text-xs font-medium">{category}</Text>
      </View>

      <Text className="text-base font-semibold text-craftopia-textPrimary mb-2">{title}</Text>
      <Text className="text-sm text-craftopia-textSecondary leading-5 mb-3">{description}</Text>

      <View className="flex-row items-center gap-2 mb-3">
        <View className="bg-craftopia-primary/10 px-2 py-1 rounded-full flex-row items-center">
          <Award size={12} color="#004E98" />
          <Text className="text-craftopia-primary text-xs font-medium ml-1">{points} Points</Text>
        </View>

        <View className="bg-craftopia-primary/10 px-2 py-1 rounded-full flex-row items-center">
          <Star size={12} color="#FF6700" />
          <Text className="text-craftopia-primary text-xs font-medium ml-1">4.8</Text>
        </View>
      </View>

      <View className="px-2 py-3 pb-0 bg-craftopia-surface border-t border-craftopia-light">
        <Button
          onPress={onPress}
          title={isJoined ? "Continue Quest" : "Start Quest"}
          disabled={isJoined} // ← disable if already joined
          className={isJoined ? 'opacity-50' : ''}
        />
      </View>
    </View>
  )
}

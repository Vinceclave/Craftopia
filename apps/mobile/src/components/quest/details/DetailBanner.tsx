import { Award, Star, Users, Leaf } from 'lucide-react-native'
import React from 'react'
import { Text, View } from 'react-native'
import Button from '~/components/common/Button'

interface DetailBannerProp {
  participants: number
  category: string
  title: string
  description: string
  points: number
  wasteKg?: number // NEW
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
  wasteKg = 0, // NEW
  isLoading = false,
  isJoined,
  onPress
}) => {
  if (isLoading) {
    return (
      <View className="mx-4 mt-4 p-4 bg-craftopia-surface rounded-lg border border-craftopia-light">
        <View className="h-4 bg-craftopia-light rounded mb-3 w-20" />
        <View className="h-6 bg-craftopia-light rounded mb-2 w-4/5" />
        <View className="h-4 bg-craftopia-light rounded mb-2 w-full" />
        <View className="h-4 bg-craftopia-light rounded mb-3 w-3/4" />
        <View className="flex-row gap-3 mb-4">
          <View className="h-6 bg-craftopia-light rounded-full w-24" />
          <View className="h-6 bg-craftopia-light rounded-full w-16" />
        </View>
        <View className="h-10 bg-craftopia-light rounded-lg" />
      </View>
    )
  }

  return (
    <View className="mx-4 mt-4 p-4 bg-craftopia-surface rounded-lg border border-craftopia-light">
      {/* Category Badge */}
      <View className="bg-craftopia-primary/10 px-3 py-1.5 rounded-full self-start mb-3">
        <Text className="text-craftopia-primary text-xs font-medium">{category}</Text>
      </View>

      {/* Title & Description */}
      <Text className="text-lg font-semibold text-craftopia-textPrimary mb-2">{title}</Text>
      <Text className="text-sm text-craftopia-textSecondary leading-6 mb-4">{description}</Text>

      {/* Stats Row */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-3">
          <View className="bg-craftopia-primary/10 px-3 py-1.5 rounded-full flex-row items-center">
            <Award size={14} className="text-craftopia-primary" />
            <Text className="text-craftopia-primary text-sm font-medium ml-2">{points} Points</Text>
          </View>

          {/* NEW: Waste indicator */}
          {wasteKg > 0 && (
            <View className="bg-green-50 px-3 py-1.5 rounded-full flex-row items-center">
              <Leaf size={14} className="text-green-600" />
              <Text className="text-green-600 text-sm font-medium ml-2">{wasteKg.toFixed(2)} kg</Text>
            </View>
          )}

          <View className="bg-craftopia-primary/10 px-3 py-1.5 rounded-full flex-row items-center">
            <Star size={14} className="text-craftopia-accent" />
            <Text className="text-craftopia-primary text-sm font-medium ml-2">4.8</Text>
          </View>
        </View>
        
        {/* Participants */}
        <View className="flex-row items-center bg-craftopia-light/50 px-3 py-1.5 rounded-full">
          <Users size={14} className="text-craftopia-textSecondary" />
          <Text className="text-craftopia-textSecondary text-sm font-medium ml-2">{participants}</Text>
        </View>
      </View>

      {/* Join Button */}
      <Button
        onPress={onPress}
        title={!isJoined ? 'Start Quest' : 'Quest Joined'}
        size="md"
        loading={isLoading}
        disabled={isJoined}
        className={isJoined ? 'bg-craftopia-light' : ''}
        textClassName={isJoined ? 'text-craftopia-textSecondary' : ''}
      />
    </View>
  )
}
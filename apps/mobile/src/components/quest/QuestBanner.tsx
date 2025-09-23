import { Badge } from 'lucide-react-native'
import React from 'react'
import { Text, View } from 'react-native'

export const QuestBanner = () => {
  return (
    <View className="flex-col gap-3 bg-craftopia-surface rounded-lg p-4">
      {/* Header Row */}
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-base font-semibold text-craftopia-textPrimary">
            Level 8
          </Text>
          <Text className="text-sm text-craftopia-textSecondary mt-0.5">
            Eco Champion
          </Text>
        </View>

        {/* Right side badge */}
        <View className="ml-3">
          <Badge size={24} color="#1A1A1A" />
        </View>
      </View>

      {/* Progress Section */}
      <View className="mt-2">
        <Text className="text-xs text-craftopia-textSecondary">
          Progress to Level 9
        </Text>
        <Text className="text-sm font-medium text-craftopia-textPrimary mt-0.5">
          2850 / 3000
        </Text>

        {/* Progress bar */}
        <View className="h-1.5 bg-craftopia-light rounded-full mt-2 overflow-hidden">
          <View className="h-1.5 bg-craftopia-primary w-11/12 rounded-full" />
        </View>
      </View>

      {/* Stats Row */}
      <View className="flex-row justify-between mt-4">
        <View className="px-3 py-1.5">
          <Text className="text-lg font-bold text-craftopia-textPrimary">
            12
          </Text>
          <Text className="text-xs text-craftopia-textSecondary">
            Day Streak
          </Text>
        </View>
      </View>
    </View>
  )
}
  
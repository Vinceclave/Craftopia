import { Badge } from 'lucide-react-native'
import React from 'react'
import { Text, View } from 'react-native'

export const QuestBanner = () => {
  return (
    <View className="mx-4 mt-4 p-3 bg-craftopia-surface rounded-lg">
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-sm font-medium text-craftopia-textPrimary">
            Level 8 • Eco Champion
          </Text>
          <Text className="text-xs text-craftopia-textSecondary mt-1">
            2850/3000 to next level
          </Text>
          
          {/* Compact progress bar */}
          <View className="h-1.5 bg-craftopia-light rounded-full mt-2">
            <View className="h-1.5 w-11/12 rounded-full bg-craftopia-primary" />
          </View>
        </View>

        <View className="pl-3">
          <View className="p-1.5 bg-craftopia-primary/10 rounded-full">
            <Badge size={16} color="#004E98" />
          </View>
        </View>
      </View>

      {/* Compact stats */}
      <View className="flex-row justify-between mt-3 pt-2 border-t border-craftopia-light">
        <View className="items-center">
          <Text className="text-base font-bold text-craftopia-textPrimary">12</Text>
          <Text className="text-xs text-craftopia-textSecondary">Day Streak</Text>
        </View>
        <View className="items-center">
          <Text className="text-base font-bold text-craftopia-textPrimary">48</Text>
          <Text className="text-xs text-craftopia-textSecondary">Quests</Text>
        </View>
      </View>
    </View>
  )
}

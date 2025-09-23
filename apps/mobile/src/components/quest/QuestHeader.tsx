import React from 'react'
import { View, Text } from 'react-native'

export const QuestHeader = () => {
  return (
    <View className="px-4 py-3 border-b border-craftopia-light bg-craftopia-surface">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-base font-semibold text-craftopia-textPrimary">
            Eco Quest
          </Text>
          <Text className="text-xs text-craftopia-textSecondary mt-0.5">
            Complete quests, earn rewards
          </Text>
        </View>
      </View>
    </View>
  )
}

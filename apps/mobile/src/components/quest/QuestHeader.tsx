import React from 'react'
import { View, Text } from 'react-native'

export const QuestHeader = () => {
  return (
    <View className="bg-craftopia-surface px-4 py-3 border-b border-gray-200">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-semibold text-craftopia-textPrimary">
            Quest
          </Text>
          <Text className="text-sm text-craftopia-textSecondary mt-1">
            Earn rewards by completing quests!
          </Text>
        </View>
      </View>
    </View>
  )
}

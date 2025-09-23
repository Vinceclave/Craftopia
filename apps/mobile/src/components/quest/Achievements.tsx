import { ArrowRight, Trophy } from 'lucide-react-native'
import React from 'react'
import { Text, View } from 'react-native'
import Button from '../common/Button'

export const Achievements = () => {
  return (
    <View className="mx-4 mt-4 py-2">
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-2">
          <View className="p-1.5 bg-craftopia-primary/10 rounded-full">
            <Trophy size={16} color="#004E98" />
          </View>
          <Text className="text-sm font-medium text-craftopia-textPrimary">
            Achievements
          </Text>
        </View>

        <Button
          onPress={() => {}}
          title="See more"
          size="sm"
          rightIcon={<ArrowRight size={12} color="#6B7280" />}
          className="bg-transparent px-1 py-0.5"
          textClassName="text-xs text-craftopia-textSecondary"
        />
      </View>
    </View>
  )
}

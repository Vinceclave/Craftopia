import { ArrowRight, Trophy } from 'lucide-react-native'
import React from 'react'
import { Text, View } from 'react-native'
import Button from '../common/Button'

export const Achievements = () => {
  return (
    <View className="px-3 py-2">
      {/* Header Row */}
      <View className="flex-row justify-between items-center">
        {/* Left side: icon + label */}
        <View className="flex-row items-center gap-1.5">
          <Trophy size={18} color="#004E98" /> 
          <Text className="text-base font-semibold text-craftopia-textPrimary">
            Achievements
          </Text>
        </View>

        {/* Right side: see more button */}
        <Button
          onPress={() => {}}
          title="See more"
          size="sm"
          rightIcon={<ArrowRight size={16} color="#1A1A1A" />}
          className="bg-transparent px-1.5 py-0.5"
          textClassName="text-xs text-craftopia-textSecondary"
        />
      </View>
    </View>
  )
}

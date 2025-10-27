import { ArrowLeft } from 'lucide-react-native'
import React from 'react'
import { Text, View, TouchableOpacity } from 'react-native'

interface DetailHeaderProp {
  onBackPress: () => void
  questId: number
}

export const DetailHeader: React.FC<DetailHeaderProp> = ({ onBackPress, questId }) => {
  return (
    <View className="px-4 py-3 bg-craftopia-surface border-b border-craftopia-light">
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={onBackPress}
          className="w-8 h-8 items-center justify-center rounded-full bg-craftopia-light mr-3"
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color="#5D6B5D" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-craftopia-textPrimary">
            Quest Details
          </Text>
          <Text className="text-sm text-craftopia-textSecondary mt-0.5">
            Challenge #{questId}
          </Text>
        </View>
      </View>
    </View>
  )
}
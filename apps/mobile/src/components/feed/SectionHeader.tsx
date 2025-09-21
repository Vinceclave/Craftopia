// apps/mobile/src/components/feed/SectionHeader.tsx - SIMPLIFIED
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

interface SectionHeaderProps {
  title: string
  icon: React.ReactNode
  isActive: boolean
  onPress: () => void
}

export const SectionHeader = ({ title, icon, isActive, onPress }: SectionHeaderProps) => (
  <TouchableOpacity
    onPress={onPress}
    className={`mr-6 pb-3 ${isActive ? 'border-b-2 border-blue-600' : ''}`}
  >
    <View className="flex-row items-center">
      {icon}
      <Text
        className={`text-base font-semibold ml-2 ${
          isActive ? 'text-blue-600' : 'text-gray-700'
        }`}
      >
        {title}
      </Text>
    </View>
  </TouchableOpacity>
)
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

interface SectionHeaderProps {
  title: string
  subtitle: string
  icon: React.ReactNode
  isActive: boolean
  onPress: () => void
}

export const SectionHeader = ({
  title,
  subtitle,
  icon,
  isActive,
  onPress,
}: SectionHeaderProps) => (
  <TouchableOpacity
    onPress={onPress}
    className={`mr-6 pb-2 ${isActive ? 'border-b-2 border-blue-600' : ''}`}
  >
    <View className="flex-row items-center mb-1">
      {icon}
      <Text
        className={`text-base font-semibold ml-2 ${
          isActive ? 'text-blue-600' : 'text-gray-700'
        }`}
      >
        {title}
      </Text>
    </View>
    <Text className="text-xs text-gray-500">{subtitle}</Text>
  </TouchableOpacity>
)

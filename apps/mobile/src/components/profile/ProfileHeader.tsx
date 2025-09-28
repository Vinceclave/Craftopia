import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Share2, Settings } from 'lucide-react-native'

interface ProfileHeaderProps {
  onSharePress: () => void
  onSettingsPress: () => void
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  onSharePress,
  onSettingsPress,
}) => {
  return (
    <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-base font-semibold text-craftopia-textPrimary">
            Profile
          </Text>
          <Text className="text-sm text-craftopia-textSecondary mt-0.5">
            Manage your account
          </Text>
        </View>
        <View className="flex-row gap-2 items-center">
          <TouchableOpacity
            className="w-8 h-8 bg-craftopia-light rounded-full items-center justify-center"
            onPress={onSharePress}
          >
            <Share2 size={18} className="text-craftopia-primary" />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-8 h-8 bg-craftopia-light rounded-full items-center justify-center"
            onPress={onSettingsPress}
          >
            <Settings size={18} className="text-craftopia-primary" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
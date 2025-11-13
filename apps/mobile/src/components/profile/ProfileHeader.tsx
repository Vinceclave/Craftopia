import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Share2, Settings } from 'lucide-react-native'

interface ProfileHeaderProps {
  onSharePress: () => void
  onSettingsPress: () => void
  userName?: string
  showWelcome?: boolean
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  onSharePress,
  onSettingsPress,
  userName,
  showWelcome = true,
}) => {
  return (
    <View className="bg-white px-6 py-5 border-b border-gray-100/80">
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-900 font-poppins">
            {userName || 'Profile'}
          </Text>
          {showWelcome && (
            <Text className="text-base text-gray-500 mt-1 font-nunito">
              Manage your account and preferences
            </Text>
          )}
        </View>
        
        <View className="flex-row gap-3 items-center">
          <TouchableOpacity
            className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl items-center justify-center shadow-sm shadow-gray-200/50 border border-gray-200/30 active:scale-95 transition-all"
            onPress={onSharePress}
            activeOpacity={0.7}
          >
            <Share2 size={20} color="#64748B" />
          </TouchableOpacity>
          
          <TouchableOpacity
            className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl items-center justify-center shadow-sm shadow-gray-200/50 border border-gray-200/30 active:scale-95 transition-all"
            onPress={onSettingsPress}
            activeOpacity={0.7}
          >
            <Settings size={20} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Subtle decorative element */}
      <View className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gray-200/40 to-transparent" />
    </View>
  )
}
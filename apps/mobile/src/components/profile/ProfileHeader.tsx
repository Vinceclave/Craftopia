import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { Share2, Settings, User } from 'lucide-react-native'
import { useProfile } from '~/hooks/useProfile'

interface ProfileHeaderProps {
  onSharePress: () => void
  onSettingsPress: () => void
  userName?: string
  showWelcome?: boolean
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  onSharePress,
  onSettingsPress,
  userName: propUserName,
  showWelcome = true,
}) => {
  const { profile, isLoading } = useProfile();
  const [imageError, setImageError] = useState(false);
  
  const userName = propUserName || profile?.username || 'Profile';
  const profilePicture = profile?.profile?.profile_picture_url;
  const isEmoji = profilePicture && profilePicture.length <= 2 && !profilePicture.startsWith('http');

  return (
    <View className="bg-white px-6 py-5 border-b border-gray-100/80">
      <View className="flex-row justify-between items-center">
        {/* Profile Section */}
        <View className="flex-row items-center flex-1">
          {/* Profile Picture */}
          <View className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl items-center justify-center shadow-sm shadow-gray-200/50 border border-gray-200/30 overflow-hidden mr-3">
            {isLoading ? (
              <ActivityIndicator size="small" color="#64748B" />
            ) : isEmoji || !profilePicture || imageError ? (
              <Text className="text-xl">{isEmoji ? profilePicture : '🧑‍🎨'}</Text>
            ) : (
              <Image
                source={{ uri: profilePicture }}
                className="w-full h-full"
                resizeMode="cover"
                onError={(e) => {
                  console.error('Profile picture load error:', e.nativeEvent.error);
                  setImageError(true);
                }}
                onLoad={() => setImageError(false)}
              />
            )}
          </View>

          {/* User Info */}
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900 font-poppins">
              {userName}
            </Text>
            {showWelcome && (
              <Text className="text-sm text-gray-500 mt-0.5 font-nunito">
                Manage your account
              </Text>
            )}
          </View>
        </View>
        
        {/* Action Buttons */}
        <View className="flex-row gap-2 items-center">
          <TouchableOpacity
            className="w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl items-center justify-center shadow-sm shadow-gray-200/50 border border-gray-200/30 active:scale-95"
            onPress={onSharePress}
            activeOpacity={0.7}
          >
            <Share2 size={18} color="#64748B" />
          </TouchableOpacity>
          
          <TouchableOpacity
            className="w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl items-center justify-center shadow-sm shadow-gray-200/50 border border-gray-200/30 active:scale-95"
            onPress={onSettingsPress}
            activeOpacity={0.7}
          >
            <Settings size={18} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Subtle decorative element */}
      <View className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gray-200/40 to-transparent" />
    </View>
  )
}
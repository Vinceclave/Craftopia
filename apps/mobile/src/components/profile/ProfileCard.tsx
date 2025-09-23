import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import { Pencil, CheckCircle } from 'lucide-react-native'

interface UserProfile {
  username?: string
  name?: string
  bio?: string
  avatar?: string
  joinDate?: string
  location?: string
  verified?: boolean
}

interface ProfileCardProps {
  userProfile: UserProfile
  onEditPress: () => void
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  userProfile,
  onEditPress,
}) => {
  return (
    <View className="p-4 bg-craftopia-surface">
      {/* Top Row: Avatar + Name + Edit */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-ce  nter gap-3 flex-1">
          <View className="relative">
            {userProfile.avatar ? (
              <Image
                source={{ uri: userProfile.avatar }}
                className="w-14 h-14 rounded-full"
              />
            ) : (
              <View className="w-14 h-14 rounded-full bg-craftopia-light" />
            )}

            {/* Verified Badge on Avatar */}
            {userProfile.verified && (
              <View className="absolute bottom-0 right-0 bg-white rounded-full p-0.5">
                <CheckCircle size={14} color="#3B82F6" />
              </View>
            )}
          </View>

          <View className="flex-1">
            <Text className="text-base font-bold text-craftopia-textPrimary">
              {userProfile.name}
            </Text>
            <Text className="text-xs text-craftopia-textSecondary">
              @{userProfile.username}
            </Text>
          </View>
        </View>

        {/* Edit Button */}
        <TouchableOpacity
          onPress={onEditPress}
          className="w-8 h-8 items-center justify-center rounded-full bg-craftopia-light"
        >
          <Pencil size={16} color="#004E98" />
        </TouchableOpacity>
      </View>

      {/* Bio */}
      {userProfile.bio && (
        <Text className="text-sm text-craftopia-textPrimary mt-3">
          {userProfile.bio}
        </Text>
      )}

      {/* Extra Info */}
      <Text className="text-xs text-craftopia-textSecondary mt-2">
        Joined {userProfile.joinDate} · {userProfile.location}
      </Text>
    </View>
  )
}

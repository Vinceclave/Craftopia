// ProfileCard.jsx - Optimized for mobile
import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import { CheckCircle, MapPin, Calendar, Settings, Sparkles, Award } from 'lucide-react-native'
import Button from '../common/Button'

interface UserProfile {
  username?: string
  name?: string
  bio?: string
  avatar?: string
  joinDate?: string
  location?: string
  verified?: boolean
  level?: number
  totalPoints?: number
  title?: string
}

interface ProfileCardProps {
  userProfile: UserProfile
  onEditPress: () => void
  onSettingsPress: () => void
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  userProfile,
  onSettingsPress,
  onEditPress,
}) => {
  return (
    <View className="bg-craftopia-surface px-4 py-4 border-b border-craftopia-light/30">
      {/* Header Section */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <View className="flex-row items-start gap-3 mb-3">
            {/* Avatar */}
            <View className="relative">
              <View className="w-14 h-14 rounded-xl bg-craftopia-light/50 items-center justify-center border border-craftopia-light">
                {userProfile.avatar ? (
                  <Image
                    source={{ uri: userProfile.avatar }}
                    className="w-full h-full rounded-xl"
                  />
                ) : (
                  <Text className="text-xl font-bold text-craftopia-primary">
                    {userProfile.name?.charAt(0) || 'U'}
                  </Text>
                )}
              </View>
              
              {/* Level Badge */}
              <View className="absolute -bottom-1 -right-1 bg-craftopia-accent rounded-full px-1.5 py-0.5 min-w-6 items-center justify-center border border-craftopia-surface">
                <Text className="text-xs font-bold text-craftopia-surface" style={{ fontSize: 10 }}>
                  {userProfile.level || 1}
                </Text>
              </View>
            </View>

            {/* User Info */}
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Text className="text-lg font-bold text-craftopia-textPrimary">
                  {userProfile.name}
                </Text>
                {userProfile.verified && (
                  <CheckCircle size={14} color="#374A36" fill="currentColor" />
                )}
              </View>
              <Text className="text-sm text-craftopia-textSecondary mb-2">
                @{userProfile.username}
              </Text>
              
              {/* Title & Points */}
              <View className="flex-row items-center gap-1.5">
                <View className="bg-craftopia-primary/10 rounded-full px-2 py-1">
                  <Text className="text-xs font-semibold text-craftopia-primary">
                    {userProfile.title || 'Maker'}
                  </Text>
                </View>
                <View className="bg-craftopia-accent/10 rounded-full px-2 py-1">
                  <Text className="text-xs font-semibold text-craftopia-accent">
                    {userProfile.totalPoints || 0} pts
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bio Section */}
          {userProfile.bio && (
            <View className="mb-3">
              <Text className="text-sm text-craftopia-textPrimary leading-5">
                {userProfile.bio}
              </Text>
            </View>
          )}

          {/* Info Stats */}
          <View className="flex-row items-center gap-3">
            {userProfile.joinDate && (
              <View className="flex-row items-center gap-1">
                <Calendar size={12} color="#5D6B5D" />
                <Text className="text-xs text-craftopia-textSecondary">
                  Joined {userProfile.joinDate}
                </Text>
              </View>
            )}
            {userProfile.location && (
              <View className="flex-row items-center gap-1">
                <MapPin size={12} color="#5D6B5D" />
                <Text className="text-xs text-craftopia-textSecondary">
                  {userProfile.location}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Settings Button */}
        <TouchableOpacity
          onPress={onSettingsPress}
          className="w-8 h-8 rounded-lg bg-craftopia-primary/10 items-center justify-center ml-2"
        >
          <Settings size={16} color="#374A36" />
        </TouchableOpacity>
      </View>

      {/* Edit Profile Button */}
      <TouchableOpacity
        onPress={onEditPress}
        className="bg-craftopia-primary rounded-lg py-2.5 items-center mt-3"
      >
        <Text className="text-sm font-semibold text-craftopia-surface">
          Edit Profile
        </Text>
      </TouchableOpacity>

      {/* Progress Bar */}
      <View className="pt-3 mt-3 border-t border-craftopia-light/30">
        <View className="flex-row justify-between mb-1.5">
          <Text className="text-sm font-medium text-craftopia-textPrimary">
            Level {userProfile.level} Progress
          </Text>
          <Text className="text-sm font-semibold text-craftopia-primary">
            {Math.floor(((userProfile.totalPoints || 0) % 100) / 100 * 100)}%
          </Text>
        </View>
        <View className="w-full h-1.5 bg-craftopia-light rounded-full overflow-hidden">
          <View 
            className="h-full bg-craftopia-primary rounded-full"
            style={{ width: `${((userProfile.totalPoints || 0) % 100) / 100 * 100}%` }}
          />
        </View>
      </View>
    </View>
  )
}
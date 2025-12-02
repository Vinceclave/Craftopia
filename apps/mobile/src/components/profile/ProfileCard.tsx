// ProfileCard.jsx - Refined text sizes
import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import { CheckCircle, MapPin, Calendar, Settings, Award, Sparkles, Users, Star } from 'lucide-react-native'

interface UserProfile {
  username?: string
  name?: string
  bio?: string
  avatar?: string
  joinDate?: string
  location?: string
  verified?: boolean
  totalPoints?: number
  followers?: number
  following?: number
  streak?: number
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
    <View className="bg-craftopia-surface px-4 py-4 pt-6 border-b border-craftopia-light">
      {/* Background decorative elements */}
      <View className="absolute top-0 right-0 w-32 h-32 bg-craftopia-primary/5 rounded-full -mr-8 -mt-8" />
      <View className="absolute bottom-4 left-4 w-16 h-16 bg-craftopia-secondary/5 rounded-full" />
      
      {/* Header Section */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <View className="flex-row items-start gap-3 mb-3">
            {/* Avatar */}
            <View className="relative">
              <View className="w-14 h-14 rounded-xl bg-craftopia-primary p-0.5">
                <View className="w-full h-full rounded-xl bg-craftopia-surface items-center justify-center overflow-hidden">
                  {userProfile.avatar ? (
                    <Image
                      source={{ uri: userProfile.avatar }}
                      className="w-full h-full rounded-xl"
                    />
                  ) : (
                    <View className="w-full h-full bg-craftopia-primary/20 items-center justify-center rounded-xl">
                      <Text className="text-lg font-bold text-craftopia-primary">
                        {userProfile.name?.charAt(0) || 'U'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              
              {/* Online status indicator */}
              <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-craftopia-success border-2 border-craftopia-surface rounded-full" />
            </View>

            {/* User Info */}
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Text className="text-base font-poppinsBold text-craftopia-textPrimary">
                  {userProfile.name}
                </Text>
                {userProfile.verified && (
                  <View className="bg-craftopia-success rounded-full p-0.5">
                    <CheckCircle size={12} color="#FFFFFF" />
                  </View>
                )}
              </View>
              
              <Text className="text-xs font-nunito text-craftopia-textSecondary mb-2">
                @{userProfile.username}
              </Text>
            </View>
          </View>

          {/* Bio Section */}
          {userProfile.bio && (
            <View className="mb-3 p-2 bg-craftopia-light rounded-lg">
              <Text className="text-xs font-nunito text-craftopia-textPrimary leading-4">
                {userProfile.bio}
              </Text>
            </View>
          )}

          {/* Stats Row */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              {userProfile.joinDate && (
                <View className="flex-row items-center gap-1 bg-craftopia-primary/8 rounded-full px-2 py-1 border border-craftopia-primary/15">
                  <Calendar size={12} color="#5C89B5" />
                  <Text className="text-xs font-nunito text-craftopia-info font-medium">
                    {userProfile.joinDate}
                  </Text>
                </View>
              )}
            </View>
            
            {/* Points */}
            <View className="bg-craftopia-accent/15 rounded-lg px-2 py-1.5 border border-craftopia-accent/20">
              <View className="flex-row items-center gap-1.5">
                <View className="bg-craftopia-warning rounded-full p-0.5">
                  <Award size={12} color="#FFFFFF" />
                </View>
                <Text className="text-xs font-poppinsBold text-craftopia-warning">
                  {userProfile.totalPoints || 0} pts
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings Button */}
        <TouchableOpacity
          onPress={onSettingsPress}
          className="w-8 h-8 rounded-lg bg-craftopia-primary/10 items-center justify-center ml-2 active:opacity-70 border border-craftopia-primary/20"
        >
          <Settings size={16} color="#3B6E4D" />
        </TouchableOpacity>
      </View>

      {/* Edit Profile Button */}
      <TouchableOpacity
        onPress={onEditPress}
        className="bg-craftopia-primary rounded-lg py-2.5 items-center active:opacity-80"
      >
        <Text className="text-sm font-poppinsBold text-craftopia-surface">
          Edit Profile
        </Text>
      </TouchableOpacity>
    </View>
  )
}
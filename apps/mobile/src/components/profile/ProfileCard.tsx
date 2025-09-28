import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import { Pencil, CheckCircle, MapPin, Calendar, Pen, Settings } from 'lucide-react-native'
import Button from '../common/Button'

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
  onSettingsPress: () => void
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  userProfile,
  onSettingsPress,
  onEditPress,
}) => {
  return (
    <View className="p-5 bg-craftopia-surface rounded-2xl border-b border-craftopia-primary/5">
      {/* Header Section */}
      <View className="flex-row items-start justify-between mb-4">
        <View className="flex-row items-start gap-4 flex-1">
          {/* Avatar with Enhanced Styling */}
          <View className="relative">
            <View className="w-16 h-16 rounded-2xl bg-craftopia-light/50 items-center justify-center border-2 border-craftopia-light">
              {userProfile.avatar ? (
                <Image
                  source={{ uri: userProfile.avatar }}
                  className="w-full h-full rounded-2xl"
                />
              ) : (
                <Text className="text-2xl font-bold text-craftopia-primary">
                  {userProfile.name?.charAt(0) || 'U'}
                </Text>
              )}
            </View>

            {/* Enhanced Verified Badge */}
            {userProfile.verified && (
              <View className="absolute -top-1 -right-1 bg-craftopia-surface rounded-full p-1 shadow-sm border border-craftopia-light">
                <CheckCircle size={14} className="text-craftopia-primary" fill="currentColor" />
              </View>
            )}
          </View>

          {/* User Info with Enhanced Typography */}
          <View className="flex-1 pt-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-lg font-bold text-craftopia-textPrimary">
                {userProfile.name}
              </Text>
              {userProfile.verified && (
                <CheckCircle size={14} className="text-craftopia-primary" fill="currentColor" />
              )}
            </View>
            <Text className="text-sm text-craftopia-textSecondary/90 mb-2">
              @{userProfile.username}
            </Text>
          </View>
        </View>

        {/* Enhanced Edit Button */}
        <Button
          title=''
          onPress={onSettingsPress}
          leftIcon={<Settings size={18}/>}
          iconOnly
          className='bg-craftopia-primary/10'
        
        />
      </View>

      {/* Bio Section */}
      {userProfile.bio && (
        <View className="mb-4">
          <Text className="text-sm text-craftopia-textPrimary leading-6 bg-craftopia-light/30 rounded-lg p-3">
            {userProfile.bio}
          </Text>
        </View>
      )}

      {/* Enhanced Info Section */}
      {(userProfile.joinDate || userProfile.location) && (
        <View className="flex-row items-center gap-4 pt-3 border-t border-craftopia-light/30">
          {userProfile.joinDate && (
            <View className="flex-row items-center gap-1.5">
              <Calendar size={12} className="text-craftopia-textSecondary/70" />
              <Text className="text-xs text-craftopia-textSecondary/80">
                Joined {userProfile.joinDate}
              </Text>
            </View>
          )}
          {userProfile.location && (
            <View className="flex-row items-center gap-1.5">
              <MapPin size={12} className="text-craftopia-textSecondary/70" />
              <Text className="text-xs text-craftopia-textSecondary/80">
                {userProfile.location}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
}
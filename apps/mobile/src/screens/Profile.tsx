import React from 'react'
import { ScrollView, View } from 'react-native'
import { User, Trophy, Zap } from 'lucide-react-native'
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { ProfileStackParamList } from "../navigations/types"
import { useAuth } from '~/context/AuthContext'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ProfileHeader } from '~/components/profile/ProfileHeader'
import { ProfileCard } from '~/components/profile/ProfileCard'
import { QuickActions } from '~/components/profile/QuickActions'

interface UserProfile {
  username?: string
  name?: string
  email?: string
  avatar?: string
  verified?: boolean
  joinDate?: string
  bio?: string
  level?: number
  title?: string
  totalPoints?: number
  nextLevelPoints?: number
  location?: string
}

export const ProfileScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList, "Profile">>()
  const { user } = useAuth()

  const userProfile: UserProfile = {
    username: user?.username || 'Username',
    name: user?.profile?.full_name || user?.username || 'User Name',
    email: user?.email || 'email@example.com',
    avatar: user?.profile?.profile_picture_url || '',
    verified: user?.is_email_verified || false,
    joinDate: user?.created_at
      ? new Date(user.created_at).toLocaleDateString()
      : 'Unknown',
    bio: user?.profile?.bio || 'This user has not set a bio yet.',
    level: Math.floor((user?.profile?.points || 0) / 100) + 1,
    title: 'Maker',
    totalPoints: user?.profile?.points || 0,
    nextLevelPoints:
      (Math.floor((user?.profile?.points || 0) / 100) + 1) * 100,
    location: user?.profile?.location || 'Unknown',
  }

  const stats = [
    { label: 'Posts', value: '12', icon: User },
    { label: 'Points', value: userProfile.totalPoints?.toString() || '0', icon: Trophy },
    { label: 'Level', value: userProfile.level?.toString() || '1', icon: Zap },
  ]

  const quickActions = [
    { label: 'My Posts', icon: User, color: 'primary', onPress: () => console.log('Navigate to my posts') },
    { label: 'Achievements', icon: Trophy, color: 'growth', onPress: () => console.log('Navigate to achievements') },
    { label: 'Activity Log', icon: Zap, color: 'accent', onPress: () => console.log('Navigate to activity log') },
  ]

  const handleSharePress = () => console.log('Share pressed')
  const handleSettingsPress = () => navigation.navigate("Settings")
  const handleEditPress = () => navigation.navigate("EditProfile")

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-light">
      <ProfileHeader
        onSharePress={handleSharePress}
        onSettingsPress={handleSettingsPress}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        <ProfileCard userProfile={userProfile} onEditPress={handleEditPress} />
        <QuickActions actions={quickActions} />
        
        {/* Extra bottom spacing matching EcoQuest */}
        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  )
}

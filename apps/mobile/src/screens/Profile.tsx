import React from 'react'
import { ScrollView, View, ActivityIndicator, Text } from 'react-native'
import { User, Trophy, Zap } from 'lucide-react-native'
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { ProfileStackParamList } from "../navigations/types"
import { SafeAreaView } from 'react-native-safe-area-context'

import { ProfileHeader } from '~/components/profile/ProfileHeader'
import { ProfileCard } from '~/components/profile/ProfileCard'
import { QuickActions } from '~/components/profile/QuickActions'
import { useCurrentUser } from '~/hooks/useAuth'

export const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList, "Profile">>();
  const { data: user, isLoading, error } = useCurrentUser();

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-light">
        <ProfileHeader
          onSharePress={() => console.log('Share pressed')}
          onSettingsPress={() => navigation.navigate("Settings")}
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#004E98" />
          <Text className="text-craftopia-textSecondary mt-2">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-light">
        <ProfileHeader
          onSharePress={() => console.log('Share pressed')}
          onSettingsPress={() => navigation.navigate("Settings")}
        />
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-craftopia-textPrimary text-center mb-2">Failed to load profile</Text>
          <Text className="text-craftopia-textSecondary text-center">{error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Safe user profile with fallbacks
  const userProfile = {
    username: user?.username || 'User',
    name: user?.profile?.full_name || user?.username || 'User Name',
    email: user?.email || 'email@example.com',
    avatar: user?.profile?.profile_picture_url || '🧑‍🎨',
    verified: user?.is_email_verified || false,
    joinDate: user?.created_at
      ? new Date(user.created_at).toLocaleDateString()
      : 'Unknown',
    bio: user?.profile?.bio || 'This user has not set a bio yet.',
    level: Math.floor((user?.profile?.points || 0) / 100) + 1,
    title: 'Maker',
    totalPoints: user?.profile?.points || 0,
    nextLevelPoints: (Math.floor((user?.profile?.points || 0) / 100) + 1) * 100,
    location: user?.profile?.location || 'Unknown',
  };

  const stats = [
    { label: 'Posts', value: '12', icon: User },
    { label: 'Points', value: userProfile.totalPoints?.toString() || '0', icon: Trophy },
    { label: 'Level', value: userProfile.level?.toString() || '1', icon: Zap },
  ];

  const quickActions = [
    { label: 'My Posts', icon: User, color: 'primary' as const, onPress: () => console.log('Navigate to my posts') },
    { label: 'Achievements', icon: Trophy, color: 'growth' as const, onPress: () => console.log('Navigate to achievements') },
    { label: 'Activity Log', icon: Zap, color: 'accent' as const, onPress: () => console.log('Navigate to activity log') },
  ];

  console.log(userProfile)


  const handleSharePress = () => console.log('Share pressed');
  const handleSettingsPress = () => navigation.navigate("Settings");
  const handleEditPress = () => navigation.navigate("EditProfile");

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-light">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        <ProfileCard userProfile={userProfile} onEditPress={handleEditPress} />
        <QuickActions actions={quickActions} />
        
        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
};
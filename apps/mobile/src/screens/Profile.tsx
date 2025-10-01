// ProfileScreen.tsx - Updated with compact layout
import React from 'react'
import { ScrollView, View, ActivityIndicator, Text } from 'react-native'
import { User, Trophy, Zap, Sparkles, BookOpen, Folder } from 'lucide-react-native'
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { ProfileStackParamList } from "../navigations/types"
import { SafeAreaView } from 'react-native-safe-area-context'

import { ProfileHeader } from '~/components/profile/ProfileHeader'
import { ProfileCard } from '~/components/profile/ProfileCard'
import { QuickActions } from '~/components/profile/QuickActions'
import { useAuth } from '~/context/AuthContext'

export const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList, "Profile">>();
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-light">
        <ProfileHeader
          onSharePress={() => console.log('Share pressed')}
          onSettingsPress={() => navigation.navigate("Settings")}
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#374A36" />
          <Text className="text-craftopia-textSecondary mt-2">
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const userProfile = {
    username: user.username || 'User',
    name: user.profile?.full_name || user.username || 'User Name',
    avatar: user.profile?.profile_picture_url,
    verified: user.is_email_verified || false,
    joinDate: user.created_at
      ? new Date(user.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        })
      : undefined,
    bio: user.profile?.bio || 'Crafting a sustainable future, one project at a time. 🌱',
    level: Math.floor((user.profile?.points || 0) / 100) + 1,
    title: getTitleByPoints(user.profile?.points || 0),
    totalPoints: user.profile?.points || 0,
    location: user.profile?.location,
  };

  console.log(userProfile)

  function getTitleByPoints(points: number): string {
    if (points >= 1000) return 'Master Crafter';
    if (points >= 500) return 'Expert Artisan';
    if (points >= 200) return 'Skilled Maker';
    return 'Novice Crafter';
  }

  // Compact quick actions
  const quickActions = [
    { 
      label: 'Crafts', 
      icon: Folder, 
      color: 'primary' as const, 
      onPress: () => navigation.navigate("MyCrafts"),
      badge: 3
    },
    { 
      label: 'Achievements', 
      icon: Trophy, 
      color: 'growth' as const, 
      onPress: () => navigation.navigate("Achievements"),
    },
    { 
      label: 'Activity', 
      icon: Zap, 
      color: 'accent' as const, 
      onPress: () => navigation.navigate("ActivityLog") 
    },
  ];

  const stats = [
    {
      label: 'Crafts',
      value: '12',
      change: '+2 this week',
    },
    {
      label: 'Points',
      value: userProfile.totalPoints.toString(),
      change: 'Level ' + userProfile.level,
    },
    {
      label: 'Waste Saved',
      value: `${(userProfile.totalPoints * 0.1).toFixed(1)}kg`,
      change: 'Environmental impact',
    },
  ];

  const handleSharePress = () => console.log('Share pressed');
  const handleSettingsPress = () => navigation.navigate("Settings");
  const handleEditPress = () => navigation.navigate("EditProfile");

  // Compact Stats Section
  const StatsSection = () => (
    <View className="mx-5 mb-6">
      <View className="flex-row items-center mb-4">
        <View className="w-6 h-6 rounded-full bg-craftopia-success/10 items-center justify-center mr-2">
          <Trophy size={14} className="text-craftopia-success" />
        </View>
        <Text className="text-lg font-semibold text-craftopia-textPrimary">
          Stats
        </Text>
      </View>

      <View className="flex-row justify-between">
        {stats.map((stat, index) => (
          <View key={index} className="items-center flex-1 mx-1">
            <View className="bg-craftopia-surface rounded-xl p-3 items-center border border-craftopia-light/50 w-full">
              <Text className="text-lg font-bold text-craftopia-textPrimary mb-1">
                {stat.value}
              </Text>
              <Text className="text-xs text-craftopia-textPrimary font-medium text-center mb-1">
                {stat.label}
              </Text>
              <Text className="text-xs text-craftopia-textSecondary text-center">
                {stat.change}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-light">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <ProfileCard 
          userProfile={userProfile} 
          onEditPress={handleEditPress} 
          onSettingsPress={handleSettingsPress}
        />
        
        <QuickActions actions={quickActions} />
        
       
      </ScrollView>
    </SafeAreaView>
  );
};
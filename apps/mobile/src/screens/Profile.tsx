// ProfileScreen.tsx - Updated with QuickActions as content switcher
import React, { useState } from 'react'
import { ScrollView, View, ActivityIndicator, Text } from 'react-native'
import { Trophy, Zap, Folder, FileText } from 'lucide-react-native'
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { ProfileStackParamList } from "../navigations/types"
import { SafeAreaView } from 'react-native-safe-area-context'

import { ProfileCard } from '~/components/profile/ProfileCard'
import { QuickActions, QuickAction } from '~/components/profile/QuickActions'
import { ProfileActivity } from '~/components/profile/ProfileActivity'
import { ProfilePosts } from '~/components/profile/ProfilePosts'
import { useAuth } from '~/context/AuthContext'

type ContentType = 'mypost' | 'crafts' | 'activity'

export const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList, "Profile">>();
  const { user, isLoading } = useAuth();
  const [activeContent, setActiveContent] = useState<ContentType>('mypost');

  if (isLoading || !user) {
    return (
      <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B6E4D" />
          <Text className="text-craftopia-textSecondary mt-2 font-nunito">
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

  function getTitleByPoints(points: number): string {
    if (points >= 1000) return 'Master Crafter';
    if (points >= 500) return 'Expert Artisan';
    if (points >= 200) return 'Skilled Maker';
    return 'Novice Crafter';
  }

  const handleSettingsPress = () => navigation.navigate("Settings");
  const handleEditPress = () => navigation.navigate("EditProfile");

  // Quick Actions that switch content
  const quickActions: QuickAction[] = [
    { 
      label: 'My Posts',
      icon: FileText,
      color: activeContent === 'mypost' ? 'primary' : undefined,
      onPress: () => setActiveContent('mypost'),
    },
    { 
      label: 'Activity',
      icon: Zap,
      color: activeContent === 'activity' ? 'accent' : undefined,
      onPress: () => setActiveContent('activity')
    },
  ];

  // My Posts Section
  const MyPostsSection = () => (
    <View className="mt-3 mb-6">
      <ProfilePosts />
    </View>
  );

  // Crafts Content
  const CraftsContent = () => (
    <View className="mx-5 mt-3 mb-6">
      <Text className="text-base font-semibold text-craftopia-textPrimary mb-4 font-poppinsBold">
        My Crafts
      </Text>
      <View className="bg-craftopia-surface rounded-xl p-6 items-center border border-craftopia-light">
        <Folder size={48} color="#5F6F64" />
        <Text className="text-craftopia-textSecondary text-center mt-3 font-nunito">
          Your crafts will appear here
        </Text>
      </View>
    </View>
  );

  // Activity Content
  const ActivityContent = () => (
    <View className="mt-3 mb-6">
      <ProfileActivity />
    </View>
  );

  // Render content based on active selection
  const renderContent = () => {
    switch (activeContent) {
      case 'mypost':
        return <MyPostsSection />;
      case 'crafts':
        return <CraftsContent />;
      case 'activity':
        return <ActivityContent />;
      default:
        return <MyPostsSection />;
    }
  };

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-background">
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
        
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};
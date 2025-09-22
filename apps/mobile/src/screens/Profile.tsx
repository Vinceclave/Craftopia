import React from 'react';
import { ScrollView } from 'react-native';
import { User, Trophy, Zap } from 'lucide-react-native';
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigations/types";
import { useAuth } from '~/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import divided components
import { ProfileHeader } from '~/components/profile/ProfileHeader';
import { ProfileCard } from '~/components/profile/ProfileCard';
import { QuickActions } from '~/components/profile/QuickActions';
import { StatsGrid } from '~/components/profile/StatsGrid';

interface UserProfile {
  username?: string;
  name?: string;
  email?: string;
  avatar?: string;
  verified?: boolean;
  joinDate?: string;
  bio?: string;
  level?: number;
  title?: string;
  totalPoints?: number;
  nextLevelPoints?: number;
  location?: string;
}

// Craftopia semantic colors
const craftopiaColors = {
  primary: "#004E98",
  secondary: "#00A896",
  accent: "#FF6700",
  digital: "#004E98",
  spark: "#FF6700",
  growth: "#10B981",
  focus: "#4F46E5",
  energy: "#FF6B6B",
};

export const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList, "Profile">>();
  const { user } = useAuth();

  const userProfile: UserProfile = {
    username: user?.username || 'Username',
    name: user?.profile?.full_name || user?.username || 'User Name',
    email: user?.email || 'email@example.com',
    avatar: user?.profile?.profile_picture_url || '🧑‍🎨',
    verified: user?.is_email_verified || false,
    joinDate: user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown',
    bio: user?.profile?.bio || 'This user has not set a bio yet.',
    level: Math.floor((user?.profile?.points || 0) / 100) + 1,
    title: 'Maker',
    totalPoints: user?.profile?.points || 0,
    nextLevelPoints: (Math.floor((user?.profile?.points || 0) / 100) + 1) * 100,
    location: user?.profile?.location || 'Unknown',
  };

  // Stats with Craftopia colors
  const stats = [
    { label: 'Posts', value: '12', icon: User, color: 'primary' },
    { label: 'Points', value: userProfile.totalPoints?.toString() || '0', icon: Trophy, color: 'growth' },
    { label: 'Level', value: userProfile.level?.toString() || '1', icon: Zap, color: 'accent' },
  ];

  // Quick actions with Craftopia colors
  const quickActions = [
    { label: 'My Posts', icon: User, color: 'primary', onPress: () => console.log('Navigate to my posts') },
    { label: 'Achievements', icon: Trophy, color: 'growth', onPress: () => console.log('Navigate to achievements') },
    { label: 'Activity Log', icon: Zap, color: 'accent', onPress: () => console.log('Navigate to activity log') },
  ];

  const handleSharePress = () => console.log('Share pressed');
  const handleSettingsPress = () => navigation.navigate("Settings");
  const handleEditPress = () => navigation.navigate("EditProfile");

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-light">
      <ProfileHeader 
        onSharePress={handleSharePress}
        onSettingsPress={handleSettingsPress}
      />

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <ProfileCard 
          userProfile={userProfile}
          onEditPress={handleEditPress}
        />

        <StatsGrid stats={stats} />

        <QuickActions actions={quickActions} />
      </ScrollView>
    </SafeAreaView>
  );
};
  
import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { CheckCircle, Camera, Share2, Settings, Edit3, MapPin, Calendar } from 'lucide-react-native';
import { authService } from '~/services/auth.service';
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigations/types";
import { useAuth } from '~/context/AuthContext';

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

export const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList, "Profile">>();
  const { user } = useAuth(); // Get user from context - no loading needed!

  console.log(user)

  // Create profile data directly from auth user - instant display
  const userProfile: UserProfile = {
    username: user?.username || 'Username',
    name: user?.profile?.full_name || user?.username || 'User Name',
    email: user?.email || 'email@example.com',
    avatar: user?.profile?.profile_picture_url || '🧑‍🎨',
    verified: user?.is_email_verified || false,
    joinDate: user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown',
    bio: user?.profile?.bio || 'This user has not set a bio yet.',
    level: Math.floor((user?.profile?.points || 0) / 100) + 1, // Simple level calculation
    title: 'Maker',
    totalPoints: user?.profile?.points || 0,
    nextLevelPoints: (Math.floor((user?.profile?.points || 0) / 100) + 1) * 100,
    location: user?.profile?.location || 'Unknown',
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F0F0F0' }}>
      {/* Floating Background Shapes */}
      <View className="absolute inset-0 overflow-hidden">
        <View 
          className="absolute -top-32 -right-32 w-64 h-64 rounded-full opacity-4" 
          style={{ backgroundColor: '#004E98' }} 
        />
        <View 
          className="absolute top-80 -left-24 w-48 h-48 rounded-full opacity-3" 
          style={{ backgroundColor: '#7C9885' }} 
        />
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header */}
        <View className="px-6 pt-12 pb-6">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <View 
                  className="w-2 h-2 rounded-full mr-3"
                  style={{ backgroundColor: '#004E98' }}
                />
                <Text className="text-sm font-semibold tracking-wider uppercase" style={{ color: '#333333' }}>
                  My Profile
                </Text>
              </View>
              <Text className="text-4xl font-black tracking-tight" style={{ color: '#004E98' }}>
                Build and earn
              </Text>
            </View>
            
            <View className="flex-row items-center space-x-3">
              {/* Share Button */}
              <TouchableOpacity 
                onPress={() => console.log('Share pressed')}
                className="w-12 h-12 rounded-2xl items-center justify-center"
                style={{ 
                  backgroundColor: 'white',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  borderWidth: 1,
                  borderColor: 'rgba(0, 0, 0, 0.03)'
                }}
              >
                <Share2 size={20} color="#00A896" />
              </TouchableOpacity>
              
              {/* Settings Button */}
              <TouchableOpacity 
                onPress={() => navigation.navigate("Settings")}
                className="w-12 h-12 rounded-2xl items-center justify-center"
                style={{ 
                  backgroundColor: 'white',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  borderWidth: 1,
                  borderColor: 'rgba(0, 0, 0, 0.03)'
                }}
              >
                <Settings size={20} color="#004E98" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Card */}
          <View 
            className="bg-white rounded-2xl p-6 relative overflow-hidden"
            style={{ 
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.06,
              shadowRadius: 20,
              borderWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.03)'
            }}
          >
            <View 
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: '#004E98' }}
            />

            <View className="flex-row items-start justify-between mb-6">
              <View className="flex-row items-start">
                <View 
                  className="w-20 h-20 rounded-2xl items-center justify-center mr-4 relative"
                  style={{ backgroundColor: '#004E9812' }}
                >
                  <Text className="text-4xl">{userProfile.avatar}</Text>
                  <TouchableOpacity 
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl items-center justify-center"
                    style={{ backgroundColor: '#FF6700' }}
                  >
                    <Camera size={14} color="#ffffff" />
                  </TouchableOpacity>
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-2xl font-black mr-2" style={{ color: '#004E98' }}>
                      {userProfile.name}
                    </Text>
                    {userProfile.verified && (
                      <View 
                        className="w-6 h-6 rounded-full items-center justify-center"
                        style={{ backgroundColor: '#7C9885' }}
                      >
                        <CheckCircle size={14} color="#ffffff" />
                      </View>
                    )}
                  </View>
                  <Text className="text-base font-semibold mb-1" style={{ color: '#00A896' }}>
                    @{userProfile.username}
                  </Text>
                  <View 
                    className="px-3 py-1 rounded-xl self-start"
                    style={{ backgroundColor: '#7C988512' }}
                  >
                    <Text className="text-sm font-bold" style={{ color: '#7C9885' }}>
                      Level {userProfile.level} • {userProfile.title}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <Text className="text-base font-medium mb-6 leading-relaxed" style={{ color: '#333333' }}>
              {userProfile.bio}
            </Text>

            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <MapPin size={16} color="#333333" />
                <Text className="text-sm font-medium ml-2" style={{ color: '#333333' }}>
                  {userProfile.location}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Calendar size={16} color="#333333" />
                <Text className="text-sm font-medium ml-2" style={{ color: '#333333' }}>
                  Joined {userProfile.joinDate}
                </Text>
              </View>
            </View>

            {/* Level Progress */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold" style={{ color: '#333333' }}>
                  Progress to Level {userProfile.level! + 1}
                </Text>
                <Text className="text-sm font-bold" style={{ color: '#004E98' }}>
                  {userProfile.totalPoints} / {userProfile.nextLevelPoints}
                </Text>
              </View>
              <View 
                className="h-3 rounded-full overflow-hidden"
                style={{ backgroundColor: '#F0F0F0' }}
              >
                <View 
                  className="h-3 rounded-full"
                  style={{ 
                    width: `${(userProfile.totalPoints! / userProfile.nextLevelPoints!) * 100}%`,
                    backgroundColor: '#004E98'
                  }}
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => navigation.navigate("EditProfile")}
              className="flex-row items-center justify-center py-3 rounded-2xl"
              style={{ backgroundColor: '#004E9815' }}
            >
              <Edit3 size={16} color="#004E98" />
              <Text className="text-base font-bold ml-2" style={{ color: '#004E98' }}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
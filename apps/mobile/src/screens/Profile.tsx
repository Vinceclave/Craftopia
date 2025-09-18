// apps/mobile/src/screens/Profile.tsx
import React, { useState } from 'react';
import { SafeAreaView, Text, View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { 
  User, Settings, Bell, Shield, HelpCircle, LogOut, Edit3, Camera, 
  Award, Trophy, Target, Star, ChevronRight, MoreHorizontal, Share2,
  Leaf, Hammer, Users, Calendar, TrendingUp, Gift, MapPin, Heart,
  Bookmark, Clock, Zap, Badge, Crown, Medal, CheckCircle, Lock,
  Palette, Moon, Globe, Smartphone, Mail, Eye, Volume2
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';


export const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [publicProfile, setPublicProfile] = useState(true);

  const userProfile = {
    name: 'Alex Rivera',
    username: '@alexrivera',
    email: 'alex.rivera@email.com',
    avatar: '🧑‍🎨',
    verified: true,
    joinDate: 'March 2024',
    location: 'San Francisco, CA',
    bio: 'Passionate maker and eco-warrior. Love creating sustainable solutions and sharing knowledge with the community.',
    level: 8,
    title: 'Eco Champion',
    totalPoints: 2850,
    nextLevelPoints: 3000
  };

  const userStats = [
    { label: 'Projects Created', value: '23', icon: Hammer, color: '#FF6700' },
    { label: 'Eco Points', value: '2.8k', icon: Leaf, color: '#7C9885' },
    { label: 'Community Impact', value: '94%', icon: Users, color: '#00A896' },
    { label: 'Days Active', value: '127', icon: Calendar, color: '#004E98' }
  ];

  const achievements = [
    { name: 'Eco Warrior', description: 'Complete 50 eco challenges', icon: Shield, earned: true, rarity: 'Epic' },
    { name: 'Community Builder', description: 'Help 100+ makers', icon: Users, earned: true, rarity: 'Rare' },
    { name: 'Innovation Master', description: 'Create 25 unique projects', icon: Star, earned: true, rarity: 'Epic' },
    { name: 'Sustainability Expert', description: 'Save 50kg of waste', icon: Leaf, earned: false, rarity: 'Legendary' },
    { name: 'Mentor', description: 'Guide 10 new makers', icon: Heart, earned: true, rarity: 'Rare' },
    { name: 'Trendsetter', description: 'Post goes viral (1k+ likes)', icon: TrendingUp, earned: false, rarity: 'Epic' }
  ];

  const recentActivity = [
    { action: 'Completed "Zero Waste Kitchen"', time: '2 hours ago', points: 150, type: 'quest' },
    { action: 'Shared "DIY Plant Hanger" project', time: '1 day ago', points: 0, type: 'share' },
    { action: 'Earned "Green Warrior" badge', time: '3 days ago', points: 200, type: 'achievement' },
    { action: 'Joined "Sustainable Living" community', time: '1 week ago', points: 0, type: 'community' }
  ];

  const menuSections = [
    {
      title: 'Account',
      items: [
        { name: 'Edit Profile', icon: Edit3, color: '#004E98', hasChevron: true },
        { name: 'Privacy Settings', icon: Shield, color: '#7C9885', hasChevron: true },
        { name: 'Notification Preferences', icon: Bell, color: '#FF6700', hasChevron: true },
        { name: 'Account Security', icon: Lock, color: '#004E98', hasChevron: true }
      ]
    },
    {
      title: 'Preferences',
      items: [
        { name: 'Dark Mode', icon: Moon, color: '#333333', hasSwitch: true, switchValue: darkModeEnabled, onSwitchChange: setDarkModeEnabled },
        { name: 'Push Notifications', icon: Smartphone, color: '#00A896', hasSwitch: true, switchValue: notificationsEnabled, onSwitchChange: setNotificationsEnabled },
        { name: 'Public Profile', icon: Globe, color: '#7C9885', hasSwitch: true, switchValue: publicProfile, onSwitchChange: setPublicProfile },
        { name: 'Language', icon: Volume2, color: '#FF6700', hasChevron: true, subtitle: 'English' }
      ]
    },
    {
      title: 'Support',
      items: [
        { name: 'Help Center', icon: HelpCircle, color: '#00A896', hasChevron: true },
        { name: 'Contact Support', icon: Mail, color: '#004E98', hasChevron: true },
        { name: 'Community Guidelines', icon: Users, color: '#7C9885', hasChevron: true },
        { name: 'About EcoCraft', icon: Leaf, color: '#7C9885', hasChevron: true }
      ]
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return '#333333';
      case 'Rare': return '#00A896';
      case 'Epic': return '#FF6700';
      case 'Legendary': return '#7C9885';
      default: return '#333333';
    }
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
                {user?.username}
              </Text>
            </View>
            
            <View className="flex-row items-center space-x-3">
              <TouchableOpacity 
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
              
              <TouchableOpacity 
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
                    {userProfile.username}
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
                  Progress to Level {userProfile.level + 1}
                </Text>
                <Text className="text-sm font-bold" style={{ color: '#004E98' }}>
                  {userProfile.totalPoints}/{userProfile.nextLevelPoints}
                </Text>
              </View>
              <View 
                className="h-3 rounded-full overflow-hidden"
                style={{ backgroundColor: '#F0F0F0' }}
              >
                <View 
                  className="h-3 rounded-full"
                  style={{ 
                    width: `${(userProfile.totalPoints / userProfile.nextLevelPoints) * 100}%`,
                    backgroundColor: '#004E98'
                  }}
                />
              </View>
            </View>

            <TouchableOpacity 
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

        {/* Stats Grid */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-4">
            <View 
              className="w-8 h-8 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: '#7C988512' }}
            >
              <TrendingUp size={16} color="#7C9885" />
            </View>
            <Text className="text-xl font-black" style={{ color: '#004E98' }}>
              Your Stats
            </Text>
          </View>
          
          <View className="flex-row flex-wrap justify-between">
            {userStats.map((stat, index) => (
              <TouchableOpacity 
                key={index}
                className="w-[48%] bg-white rounded-2xl p-4 items-center mb-4"
                style={{ 
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.04,
                  shadowRadius: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(0, 0, 0, 0.03)'
                }}
              >
                <View 
                  className="w-12 h-12 rounded-xl items-center justify-center mb-3"
                  style={{ backgroundColor: `${stat.color}12` }}
                >
                  <stat.icon size={20} color={stat.color} />
                </View>
                <Text className="text-xl font-black mb-1" style={{ color: '#004E98' }}>
                  {stat.value}
                </Text>
                <Text className="text-xs font-semibold text-center" style={{ color: '#333333' }}>
                  {stat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Achievements */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View 
                className="w-8 h-8 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: '#FF670012' }}
              >
                <Trophy size={16} color="#FF6700" />
              </View>
              <Text className="text-xl font-black" style={{ color: '#004E98' }}>
                Achievements
              </Text>
            </View>
            
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-sm font-bold mr-2" style={{ color: '#00A896' }}>
                View all
              </Text>
              <ChevronRight size={16} color="#00A896" />
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-4">
              {achievements.slice(0, 4).map((achievement, index) => (
                <TouchableOpacity 
                  key={index}
                  className="bg-white rounded-2xl p-4 min-w-[140px]"
                  style={{ 
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.04,
                    shadowRadius: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(0, 0, 0, 0.03)',
                    opacity: achievement.earned ? 1 : 0.6
                  }}
                >
                  <View 
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: getRarityColor(achievement.rarity) }}
                  />
                  
                  <View 
                    className="w-12 h-12 rounded-xl items-center justify-center mb-3"
                    style={{ backgroundColor: achievement.earned ? '#7C988515' : '#33333315' }}
                  >
                    <achievement.icon 
                      size={20} 
                      color={achievement.earned ? '#7C9885' : '#333333'} 
                    />
                  </View>
                  
                  <Text 
                    className="text-sm font-bold mb-2"
                    style={{ color: achievement.earned ? '#004E98' : '#333333' }}
                  >
                    {achievement.name}
                  </Text>
                  
                  <View 
                    className="px-2 py-1 rounded-lg self-start"
                    style={{ backgroundColor: getRarityColor(achievement.rarity) + '15' }}
                  >
                    <Text 
                      className="text-xs font-bold"
                      style={{ color: getRarityColor(achievement.rarity) }}
                    >
                      {achievement.rarity}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Recent Activity */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View 
                className="w-8 h-8 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: '#00A89612' }}
              >
                <Clock size={16} color="#00A896" />
              </View>
              <Text className="text-xl font-black" style={{ color: '#004E98' }}>
                Recent Activity
              </Text>
            </View>
            
            <TouchableOpacity>
              <MoreHorizontal size={20} color="#333333" />
            </TouchableOpacity>
          </View>
          
          <View 
            className="bg-white rounded-2xl overflow-hidden"
            style={{ 
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.03)'
            }}
          >
            {recentActivity.map((activity, index) => (
              <View 
                key={index}
                className={`flex-row items-center px-5 py-4 ${index < recentActivity.length - 1 ? 'border-b' : ''}`}
                style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}
              >
                <View 
                  className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                  style={{ backgroundColor: '#7C988512' }}
                >
                  {activity.type === 'quest' && <Target size={16} color="#7C9885" />}
                  {activity.type === 'share' && <Share2 size={16} color="#00A896" />}
                  {activity.type === 'achievement' && <Trophy size={16} color="#FF6700" />}
                  {activity.type === 'community' && <Users size={16} color="#004E98" />}
                </View>
                
                <View className="flex-1">
                  <Text className="text-base font-semibold mb-1" style={{ color: '#004E98' }}>
                    {activity.action}
                  </Text>
                  <Text className="text-sm font-medium" style={{ color: '#333333' }}>
                    {activity.time}
                  </Text>
                </View>
                
                {activity.points > 0 && (
                  <View 
                    className="px-3 py-2 rounded-xl"
                    style={{ backgroundColor: '#7C988512' }}
                  >
                    <Text className="text-sm font-bold" style={{ color: '#7C9885' }}>
                      +{activity.points}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Menu Sections */}
        <View className="px-6">
          {menuSections.map((section, sectionIndex) => (
            <View key={sectionIndex} className="mb-6">
              <Text className="text-lg font-black mb-4" style={{ color: '#004E98' }}>
                {section.title}
              </Text>
              
              <View 
                className="bg-white rounded-2xl overflow-hidden"
                style={{ 
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.04,
                  shadowRadius: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(0, 0, 0, 0.03)'
                }}
              >
                {section.items.map((item, index) => (
                  <TouchableOpacity 
                    key={index}
                    className={`flex-row items-center px-5 py-4 ${index < section.items.length - 1 ? 'border-b' : ''}`}
                    style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}
                  >
                    <View 
                      className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                      style={{ backgroundColor: `${item.color}12` }}
                    >
                      <item.icon size={18} color={item.color} />
                    </View>
                    
                    <View className="flex-1">
                      <Text className="text-base font-semibold mb-1" style={{ color: '#004E98' }}>
                        {item.name}
                      </Text>
                      {item.subtitle && (
                        <Text className="text-sm font-medium" style={{ color: '#333333' }}>
                          {item.subtitle}
                        </Text>
                      )}
                    </View>
                    
                    {item.hasSwitch && (
                      <Switch
                        value={item.switchValue}
                        onValueChange={item.onSwitchChange}
                        trackColor={{ false: '#E5E7EB', true: '#7C988550' }}
                        thumbColor={item.switchValue ? '#7C9885' : '#F9FAFB'}
                      />
                    )}
                    
                    {item.hasChevron && (
                      <ChevronRight size={20} color="#333333" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Sign Out Button */}
          <TouchableOpacity 
            onPress={logout}
            className="flex-row items-center justify-center py-4 rounded-2xl mb-6"
            style={{ 
              backgroundColor: '#FF670015',
              borderWidth: 1,
              borderColor: '#FF670025'
            }}
          >
            <LogOut size={20} color="#FF6700" />
            <Text className="text-base font-bold ml-3" style={{ color: '#FF6700' }}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};  
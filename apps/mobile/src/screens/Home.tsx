// apps/mobile/src/screens/Home.tsx
import React from 'react';
import { SafeAreaView, Text, View, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { 
  Leaf, Trophy, Hammer, TrendingUp, Bell, Zap, Plus, ArrowUpRight, Star, Target, 
  Sparkles, Clock, Award, Users, Camera, Recycle, Sprout, ChevronRight, 
  CheckCircle, Activity, Calendar, Medal, Gift, ArrowRight, MoreHorizontal
} from 'lucide-react-native';

export const HomeScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const stats = [
    { label: 'Eco Points', value: '2.8k', icon: Leaf, color: '#7C9885', trend: '+12%', bgColor: '#7C988508' },
    { label: 'Crafts Made', value: '23', icon: Hammer, color: '#FF6700', trend: '+3', bgColor: '#FF670008' },
    { label: 'Impact Score', value: '94%', icon: TrendingUp, color: '#00A896', trend: '+2%', bgColor: '#00A89608' },
  ];

  const todayQuests = [
    { 
      title: 'Create a Plant Pot', 
      points: 150, 
      category: 'Craft', 
      progress: 0, 
      icon: Sprout, 
      difficulty: 'Easy', 
      timeEstimate: '30 min',
      color: '#7C9885',
      isNew: true
    },
    { 
      title: 'Recycle 5 Items', 
      points: 100, 
      category: 'Eco', 
      progress: 60, 
      icon: Recycle, 
      difficulty: 'Medium', 
      timeEstimate: '15 min',
      color: '#7C9885',
      isNew: false
    },
    { 
      title: 'Share Your Creation', 
      points: 75, 
      category: 'Social', 
      progress: 0, 
      icon: Camera, 
      difficulty: 'Easy', 
      timeEstimate: '5 min',
      color: '#00A896',
      isNew: false
    },
  ];

  const recentActivity = [
    { action: 'Completed "Upcycle Chair"', points: 200, icon: CheckCircle, time: '2h', type: 'achievement', color: '#7C9885' },
    { action: 'Earned "Green Warrior" badge', points: 0, icon: Medal, time: '1d', type: 'badge', color: '#FF6700' },
    { action: 'Shared DIY Tutorial', points: 150, icon: Users, time: '2d', type: 'social', color: '#00A896' },
  ];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F0F0F0' }}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Floating Background Shapes */}
        <View className="absolute inset-0 overflow-hidden">
          <View 
            className="absolute -top-32 -right-32 w-64 h-64 rounded-full opacity-4" 
            style={{ 
              backgroundColor: '#7C9885',
              transform: [{ rotate: '45deg' }]
            }} 
          />
          <View 
            className="absolute top-80 -left-24 w-48 h-48 rounded-full opacity-3" 
            style={{ 
              backgroundColor: '#00A896',
              transform: [{ rotate: '-30deg' }]
            }} 
          />
          <View 
            className="absolute bottom-40 right-12 w-32 h-32 rounded-full opacity-2" 
            style={{ backgroundColor: '#FF6700' }} 
          />
        </View>

        <View className="relative z-10">
          {/* Header Section */}
          <View className="px-6 pt-12 pb-8">
            <View className="flex-row justify-between items-start mb-6">
              <View className="flex-1">
                <View className="flex-row items-center mb-3">
                  <View 
                    className="w-2 h-2 rounded-full mr-3"
                    style={{ backgroundColor: '#FF6700' }}
                  />
                  <Text className="text-sm font-semibold tracking-wider uppercase" style={{ color: '#333333' }}>
                    Wednesday, Sep 3rd
                  </Text>
                </View>
                
                <Text className="text-4xl font-black mb-3 tracking-tight" style={{ color: '#004E98' }}>
                  {user?.username || 'Welcome back'}
                </Text>
                
                <Text className="text-lg font-medium leading-relaxed" style={{ color: '#333333' }}>
                  Ready to create something amazing today?
                </Text>
              </View>
              
              <View className="flex-row space-x-3">
                <TouchableOpacity 
                  className="w-14 h-14 rounded-2xl items-center justify-center relative overflow-hidden"
                  style={{ 
                    backgroundColor: 'white',
                    shadowColor: '#FF6700',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    borderWidth: 1,
                    borderColor: '#FF670015'
                  }}
                >
                  <Gift size={22} color="#FF6700" />
                  <View 
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
                    style={{ backgroundColor: '#FF6700' }}
                  >
                    <Text className="text-white text-xs font-bold">3</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="w-14 h-14 rounded-2xl items-center justify-center"
                  style={{ 
                    backgroundColor: 'white',
                    shadowColor: '#004E98',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    borderWidth: 1,
                    borderColor: '#004E9815'
                  }}
                  onPress={handleLogout}
                >
                  <Bell size={22} color="#004E98" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Stats Banner */}
            <View 
              className="bg-white rounded-3xl p-6 relative overflow-hidden"
              style={{ 
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.06,
                shadowRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.05)'
              }}
            >
              <View className="absolute top-0 left-6 right-6 h-1 rounded-full" style={{ backgroundColor: '#7C9885' }} />
              
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View 
                    className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: '#7C988512' }}
                  >
                    <Activity size={20} color="#7C9885" />
                  </View>
                  <View>
                    <Text className="text-2xl font-black" style={{ color: '#7C9885' }}>12.5kg</Text>
                    <Text className="text-sm font-semibold" style={{ color: '#333333' }}>waste saved</Text>
                  </View>
                </View>
                
                <View className="flex-row items-center space-x-4">
                  <View className="items-center">
                    <Text className="text-lg font-black" style={{ color: '#004E98' }}>2.8k</Text>
                    <Text className="text-xs font-semibold tracking-wide" style={{ color: '#333333' }}>POINTS</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-lg font-black" style={{ color: '#FF6700' }}>23</Text>
                    <Text className="text-xs font-semibold tracking-wide" style={{ color: '#333333' }}>CRAFTS</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View className="px-6 mb-8">
            <View className="flex-row justify-between space-x-3">
              {stats.map((stat, index) => (
                <TouchableOpacity 
                  key={index} 
                  className="flex-1 bg-white rounded-2xl py-6 px-4 items-center relative"
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
                    className="absolute top-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: stat.color }}
                  />
                  
                  <View 
                    className="w-12 h-12 rounded-xl items-center justify-center mb-4"
                    style={{ backgroundColor: stat.bgColor }}
                  >
                    <stat.icon size={20} color={stat.color} />
                  </View>
                  
                  <Text className="text-xl font-black mb-1" style={{ color: '#004E98' }}>
                    {stat.value}
                  </Text>
                  <Text className="text-xs font-semibold mb-2 text-center" style={{ color: '#333333' }}>
                    {stat.label}
                  </Text>
                  
                  <View className="flex-row items-center">
                    <TrendingUp size={10} color={stat.color} />
                    <Text className="text-xs font-bold ml-1" style={{ color: stat.color }}>
                      {stat.trend}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Today's Quests */}
          <View className="px-6 mb-8">
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <View 
                  className="w-8 h-8 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: '#004E9812' }}
                >
                  <Target size={16} color="#004E98" />
                </View>
                <Text className="text-2xl font-black" style={{ color: '#004E98' }}>
                  Today's Quests
                </Text>
              </View>
              
              <TouchableOpacity 
                className="flex-row items-center px-4 py-2 rounded-xl"
                style={{ backgroundColor: '#00A89610' }}
              >
                <Text className="text-sm font-bold mr-2" style={{ color: '#00A896' }}>
                  View all
                </Text>
                <ArrowRight size={14} color="#00A896" />
              </TouchableOpacity>
            </View>
            
            <View className="space-y-4">
              {todayQuests.map((quest, index) => (
                <TouchableOpacity 
                  key={index}
                  className="bg-white rounded-2xl p-5 relative overflow-hidden"
                  style={{ 
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                    borderWidth: 1,
                    borderColor: 'rgba(0, 0, 0, 0.03)'
                  }}
                >
                  {quest.isNew && (
                    <View 
                      className="absolute top-3 right-3 px-2 py-1 rounded-full"
                      style={{ backgroundColor: '#FF670015' }}
                    >
                      <Text className="text-xs font-bold" style={{ color: '#FF6700' }}>NEW</Text>
                    </View>
                  )}
                  
                  <View className="flex-row items-start">
                    <View 
                      className="w-14 h-14 items-center justify-center mr-4 rounded-xl"
                      style={{ 
                        backgroundColor: `${quest.color}12`,
                        borderWidth: 1,
                        borderColor: `${quest.color}20`
                      }}
                    >
                      <quest.icon size={24} color={quest.color} />
                    </View>
                    
                    <View className="flex-1">
                      <Text className="text-lg font-bold mb-2" style={{ color: '#004E98' }}>
                        {quest.title}
                      </Text>
                      
                      <View className="flex-row items-center mb-3 space-x-3">
                        <View className="flex-row items-center">
                          <View 
                            className="w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: '#333333' }}
                          />
                          <Text className="text-xs font-semibold" style={{ color: '#333333' }}>
                            {quest.category}
                          </Text>
                        </View>
                        
                        <View className="flex-row items-center">
                          <Award size={12} color="#7C9885" />
                          <Text className="text-xs font-bold ml-1" style={{ color: '#7C9885' }}>
                            +{quest.points}
                          </Text>
                        </View>
                        
                        <View className="flex-row items-center">
                          <Clock size={12} color="#FF6700" />
                          <Text className="text-xs font-medium ml-1" style={{ color: '#FF6700' }}>
                            {quest.timeEstimate}
                          </Text>
                        </View>
                      </View>
                      
                      {quest.progress > 0 && (
                        <View className="flex-row items-center">
                          <View 
                            className="flex-1 h-2 rounded-full mr-3 overflow-hidden"
                            style={{ backgroundColor: '#F0F0F0' }}
                          >
                            <View 
                              className="h-2 rounded-full"
                              style={{ 
                                width: `${quest.progress}%`,
                                backgroundColor: quest.color
                              }}
                            />
                          </View>
                          <Text className="text-sm font-bold min-w-[35px]" style={{ color: quest.color }}>
                            {quest.progress}%
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Activity */}
          <View className="px-6 mb-8">
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <View 
                  className="w-8 h-8 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: '#004E9812' }}
                >
                  <Calendar size={16} color="#004E98" />
                </View>
                <Text className="text-2xl font-black" style={{ color: '#004E98' }}>
                  Activity
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
                  className={`flex-row items-center px-5 py-5 ${index < recentActivity.length - 1 ? 'border-b' : ''}`}
                  style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}
                >
                  <View 
                    className="w-10 h-10 items-center justify-center mr-4 rounded-xl"
                    style={{ 
                      backgroundColor: `${activity.color}12`,
                      borderWidth: 1,
                      borderColor: `${activity.color}20`
                    }}
                  >
                    <activity.icon size={16} color={activity.color} />
                  </View>
                  
                  <View className="flex-1">
                    <Text className="text-base font-semibold mb-1" style={{ color: '#004E98' }}>
                      {activity.action}
                    </Text>
                    <Text className="text-sm font-medium" style={{ color: '#333333' }}>
                      {activity.time} ago
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

          {/* Action Buttons */}
          <View className="px-6 mb-8">
            <View className="flex-row space-x-4">
              <TouchableOpacity 
                className="flex-1 rounded-2xl p-6 items-center relative overflow-hidden"
                style={{ 
                  backgroundColor: '#FF6700',
                  shadowColor: '#FF6700',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.25,
                  shadowRadius: 16
                }}
              >
                <View className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white opacity-5 transform translate-x-8 -translate-y-8" />
                
                <Hammer size={24} color="#ffffff" />
                <Text className="text-white font-black text-base mt-3 mb-1">Start Crafting</Text>
                <Text className="text-white text-sm opacity-80 text-center">
                  Begin your next project
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 rounded-2xl p-6 items-center relative overflow-hidden"
                style={{ 
                  backgroundColor: '#00A896',
                  shadowColor: '#00A896',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.25,
                  shadowRadius: 16
                }}
              >
                <View className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-white opacity-5 transform -translate-x-6 translate-y-6" />
                
                <Target size={24} color="#ffffff" />
                <Text className="text-white font-black text-base mt-3 mb-1">New Quest</Text>
                <Text className="text-white text-sm opacity-80 text-center">
                  Discover challenges
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* User Profile Card */}
          {user && (
            <View className="px-6 mb-6">
              <TouchableOpacity 
                className="bg-white rounded-2xl p-5 relative overflow-hidden"
                style={{ 
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  borderWidth: 1,
                  borderColor: 'rgba(0, 0, 0, 0.03)'
                }}
                onPress={handleLogout}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-4">
                    <View className="flex-row items-center mb-2">
                      <View 
                        className="w-8 h-8 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: '#004E9812' }}
                      >
                        <Users size={14} color="#004E98" />
                      </View>
                      <Text className="text-base font-bold" style={{ color: '#004E98' }}>
                        {user.email}
                      </Text>
                    </View>
                    <View className="flex-row items-center ml-11">
                      <View 
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: user.is_email_verified ? '#7C9885' : '#FF6700' }}
                      />
                      <Text className="text-sm font-medium" style={{ 
                        color: user.is_email_verified ? '#7C9885' : '#FF6700' 
                      }}>
                        {user.is_email_verified ? 'Verified' : 'Verify email'}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center">
                    <Text className="text-sm font-semibold mr-2" style={{ color: '#333333' }}>
                      Sign out
                    </Text>
                    <ChevronRight size={16} color="#333333" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
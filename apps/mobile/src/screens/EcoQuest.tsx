// apps/mobile/src/screens/EcoQuest.tsx
import React, { useState } from 'react';
import { SafeAreaView, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { 
  Leaf, Target, Clock, Award, Star, TrendingUp, ChevronRight, Play, 
  CheckCircle, Lock, Zap, Users, Calendar, Trophy, Gift, MapPin,
  Recycle, Sprout, Droplets, Sun, Wind, Mountain, ArrowRight,
  Timer, Flame, Shield, Heart, Badge
} from 'lucide-react-native';

export const EcoQuestScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const userProgress = {
    level: 8,
    totalPoints: 2850,
    weeklyStreak: 12,
    completedQuests: 47,
    nextLevelPoints: 3000
  };

  const questCategories = [
    { id: 'all', name: 'All Quests', icon: Target, count: 24 },
    { id: 'daily', name: 'Daily', icon: Calendar, count: 3 },
    { id: 'weekly', name: 'Weekly', icon: Trophy, count: 5 },
    { id: 'challenge', name: 'Challenges', icon: Flame, count: 8 },
    { id: 'community', name: 'Community', icon: Users, count: 8 }
  ];

  const featuredQuest = {
    id: 'featured',
    title: 'Zero Waste Week Challenge',
    description: 'Go a full week producing minimal waste. Document your journey and inspire others!',
    difficulty: 'Hard',
    duration: '7 days',
    points: 500,
    participants: 1247,
    icon: Recycle,
    color: '#7C9885',
    category: 'Weekly Challenge',
    timeLeft: '3 days left',
    isActive: false
  };

  const activeQuests = [
    {
      id: 1,
      title: 'Morning Eco Routine',
      description: 'Complete 5 sustainable morning activities',
      progress: 80,
      maxProgress: 100,
      points: 50,
      timeLeft: '2h left',
      icon: Sun,
      color: '#FF6700',
      difficulty: 'Easy',
      category: 'Daily',
      isCompleted: false
    },
    {
      id: 2,
      title: 'Water Conservation',
      description: 'Save water through mindful usage',
      progress: 45,
      maxProgress: 100,
      points: 75,
      timeLeft: '1 day left',
      icon: Droplets,
      color: '#00A896',
      difficulty: 'Medium',
      category: 'Daily',
      isCompleted: false
    }
  ];

  const availableQuests = [
    {
      id: 3,
      title: 'Plastic-Free Shopping',
      description: 'Shop for groceries without using plastic bags or containers',
      points: 100,
      duration: '1 day',
      icon: Leaf,
      color: '#7C9885',
      difficulty: 'Medium',
      category: 'Individual',
      participants: 234,
      isLocked: false
    },
    {
      id: 4,
      title: 'Energy Saving Champion',
      description: 'Reduce energy consumption by 20% this week',
      points: 150,
      duration: '7 days',
      icon: Zap,
      color: '#FF6700',
      difficulty: 'Hard',
      category: 'Weekly',
      participants: 89,
      isLocked: false
    },
    {
      id: 5,
      title: 'Community Garden Helper',
      description: 'Volunteer at a local community garden',
      points: 200,
      duration: '4 hours',
      icon: Sprout,
      color: '#7C9885',
      difficulty: 'Easy',
      category: 'Community',
      participants: 156,
      isLocked: false
    },
    {
      id: 6,
      title: 'Green Transportation Week',
      description: 'Use eco-friendly transport for all trips',
      points: 300,
      duration: '7 days',
      icon: Wind,
      color: '#00A896',
      difficulty: 'Hard',
      category: 'Weekly',
      participants: 67,
      isLocked: true,
      unlockRequirement: 'Complete 3 daily quests'
    }
  ];

  const achievements = [
    { name: 'Eco Warrior', icon: Shield, earned: true },
    { name: 'Green Streak', icon: Flame, earned: true },
    { name: 'Community Champion', icon: Users, earned: false },
    { name: 'Waste Warrior', icon: Recycle, earned: true }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#7C9885';
      case 'Medium': return '#FF6700';
      case 'Hard': return '#004E98';
      default: return '#333333';
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F0F0F0' }}>
      {/* Floating Background Shapes */}
      <View className="absolute inset-0 overflow-hidden">
        <View 
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-4" 
          style={{ backgroundColor: '#7C9885' }} 
        />
        <View 
          className="absolute top-96 -left-20 w-36 h-36 rounded-full opacity-3" 
          style={{ backgroundColor: '#00A896' }} 
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
                  style={{ backgroundColor: '#7C9885' }}
                />
                <Text className="text-sm font-semibold tracking-wider uppercase" style={{ color: '#333333' }}>
                  EcoQuest Hub
                </Text>
              </View>
              <Text className="text-4xl font-black tracking-tight" style={{ color: '#004E98' }}>
                Green Challenges
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
                <Gift size={20} color="#FF6700" />
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
                <MapPin size={20} color="#00A896" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Progress Overview */}
          <View 
            className="bg-white rounded-2xl p-6 relative overflow-hidden"
            style={{ 
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.06,
              shadowRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.03)'
            }}
          >
            <View 
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: '#7C9885' }}
            />
            
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-2xl font-black" style={{ color: '#004E98' }}>
                  Level {userProgress.level}
                </Text>
                <Text className="text-sm font-semibold" style={{ color: '#333333' }}>
                  Eco Champion
                </Text>
              </View>
              
              <View 
                className="w-16 h-16 rounded-2xl items-center justify-center"
                style={{ backgroundColor: '#7C988512' }}
              >
                <Badge size={28} color="#7C9885" />
              </View>
            </View>
            
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1 mr-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-semibold" style={{ color: '#333333' }}>
                    Progress to Level {userProgress.level + 1}
                  </Text>
                  <Text className="text-sm font-bold" style={{ color: '#7C9885' }}>
                    {userProgress.totalPoints}/{userProgress.nextLevelPoints}
                  </Text>
                </View>
                <View 
                  className="h-3 rounded-full overflow-hidden"
                  style={{ backgroundColor: '#F0F0F0' }}
                >
                  <View 
                    className="h-3 rounded-full"
                    style={{ 
                      width: `${(userProgress.totalPoints / userProgress.nextLevelPoints) * 100}%`,
                      backgroundColor: '#7C9885'
                    }}
                  />
                </View>
              </View>
            </View>
            
            <View className="flex-row items-center justify-between">
              <View className="items-center">
                <Text className="text-lg font-black" style={{ color: '#FF6700' }}>
                  {userProgress.weeklyStreak}
                </Text>
                <Text className="text-xs font-semibold tracking-wide" style={{ color: '#333333' }}>
                  DAY STREAK
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-black" style={{ color: '#00A896' }}>
                  {userProgress.completedQuests}
                </Text>
                <Text className="text-xs font-semibold tracking-wide" style={{ color: '#333333' }}>
                  COMPLETED
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-black" style={{ color: '#004E98' }}>
                  {userProgress.totalPoints}
                </Text>
                <Text className="text-xs font-semibold tracking-wide" style={{ color: '#333333' }}>
                  POINTS
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Featured Quest */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-4">
            <View 
              className="w-8 h-8 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: '#FF670012' }}
            >
              <Star size={16} color="#FF6700" />
            </View>
            <Text className="text-xl font-black" style={{ color: '#004E98' }}>
              Featured Challenge
            </Text>
          </View>
          
          <TouchableOpacity 
            className="bg-white rounded-2xl p-6 relative overflow-hidden"
            style={{ 
              shadowColor: '#7C9885',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              borderWidth: 2,
              borderColor: '#7C988520'
            }}
          >
            <View 
              className="absolute top-0 left-0 right-0 h-2"
              style={{ backgroundColor: featuredQuest.color }}
            />
            
            <View className="flex-row items-start justify-between mb-4">
              <View 
                className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: `${featuredQuest.color}15` }}
              >
                <featuredQuest.icon size={24} color={featuredQuest.color} />
              </View>
              
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-2">
                  <View 
                    className="px-3 py-1 rounded-xl"
                    style={{ backgroundColor: '#FF670015' }}
                  >
                    <Text className="text-xs font-bold" style={{ color: '#FF6700' }}>
                      {featuredQuest.category}
                    </Text>
                  </View>
                  <Text className="text-sm font-semibold" style={{ color: '#333333' }}>
                    {featuredQuest.timeLeft}
                  </Text>
                </View>
                
                <Text className="text-xl font-black mb-2" style={{ color: '#004E98' }}>
                  {featuredQuest.title}
                </Text>
                <Text className="text-base font-medium mb-4 leading-relaxed" style={{ color: '#333333' }}>
                  {featuredQuest.description}
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center space-x-4">
                <View className="flex-row items-center">
                  <Award size={16} color="#7C9885" />
                  <Text className="text-sm font-bold ml-2" style={{ color: '#7C9885' }}>
                    {featuredQuest.points} pts
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Users size={16} color="#00A896" />
                  <Text className="text-sm font-medium ml-2" style={{ color: '#00A896' }}>
                    {featuredQuest.participants.toLocaleString()}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity 
                className="flex-row items-center px-5 py-3 rounded-2xl"
                style={{ backgroundColor: featuredQuest.color }}
              >
                <Text className="text-white font-bold mr-2">Join Challenge</Text>
                <ArrowRight size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        {/* Active Quests */}
        {activeQuests.length > 0 && (
          <View className="px-6 mb-6">
            <View className="flex-row items-center mb-4">
              <View 
                className="w-8 h-8 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: '#00A89612' }}
              >
                <Timer size={16} color="#00A896" />
              </View>
              <Text className="text-xl font-black" style={{ color: '#004E98' }}>
                Active Quests
              </Text>
            </View>
            
            <View className="space-y-4">
              {activeQuests.map((quest) => (
                <TouchableOpacity 
                  key={quest.id}
                  className="bg-white rounded-2xl p-5 relative overflow-hidden"
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
                    style={{ backgroundColor: quest.color }}
                  />
                  
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center flex-1">
                      <View 
                        className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                        style={{ backgroundColor: `${quest.color}12` }}
                      >
                        <quest.icon size={20} color={quest.color} />
                      </View>
                      
                      <View className="flex-1">
                        <Text className="text-lg font-bold mb-1" style={{ color: '#004E98' }}>
                          {quest.title}
                        </Text>
                        <Text className="text-sm font-medium" style={{ color: '#333333' }}>
                          {quest.description}
                        </Text>
                      </View>
                    </View>
                    
                    <View className="items-end">
                      <Text className="text-sm font-semibold mb-1" style={{ color: '#333333' }}>
                        {quest.timeLeft}
                      </Text>
                      <View 
                        className="px-3 py-1 rounded-xl"
                        style={{ backgroundColor: `${quest.color}15` }}
                      >
                        <Text className="text-xs font-bold" style={{ color: quest.color }}>
                          +{quest.points} pts
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-4">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-sm font-semibold" style={{ color: '#333333' }}>
                          Progress
                        </Text>
                        <Text className="text-sm font-bold" style={{ color: quest.color }}>
                          {quest.progress}%
                        </Text>
                      </View>
                      <View 
                        className="h-2 rounded-full overflow-hidden"
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
                    </View>
                    
                    <TouchableOpacity 
                      className="flex-row items-center px-4 py-2 rounded-xl"
                      style={{ backgroundColor: `${quest.color}15` }}
                    >
                      <Text className="text-sm font-bold mr-2" style={{ color: quest.color }}>
                        Continue
                      </Text>
                      <ChevronRight size={14} color={quest.color} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Quest Categories */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-4">
            <View 
              className="w-8 h-8 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: '#004E9812' }}
            >
              <Target size={16} color="#004E98" />
            </View>
            <Text className="text-xl font-black" style={{ color: '#004E98' }}>
              Browse Quests
            </Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            <View className="flex-row space-x-3">
              {questCategories.map((category) => (
                <TouchableOpacity 
                  key={category.id}
                  className="rounded-2xl p-4 min-w-[120px]"
                  style={{ 
                    backgroundColor: selectedCategory === category.id ? '#004E98' : 'white',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                    borderWidth: 1,
                    borderColor: selectedCategory === category.id ? '#004E98' : 'rgba(0, 0, 0, 0.03)'
                  }}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <View className="items-center">
                    <category.icon 
                      size={20} 
                      color={selectedCategory === category.id ? '#ffffff' : '#004E98'} 
                    />
                    <Text 
                      className="text-sm font-bold mt-2 text-center"
                      style={{ color: selectedCategory === category.id ? '#ffffff' : '#004E98' }}
                    >
                      {category.name}
                    </Text>
                    <Text 
                      className="text-xs font-medium mt-1"
                      style={{ color: selectedCategory === category.id ? 'rgba(255,255,255,0.8)' : '#333333' }}
                    >
                      {category.count} quests
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Available Quests */}
        <View className="px-6 mb-6">
          <View className="space-y-4">
            {availableQuests.map((quest) => (
              <TouchableOpacity 
                key={quest.id}
                className="bg-white rounded-2xl p-5 relative overflow-hidden"
                style={{ 
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: quest.isLocked ? 0.02 : 0.04,
                  shadowRadius: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(0, 0, 0, 0.03)',
                  opacity: quest.isLocked ? 0.6 : 1
                }}
                disabled={quest.isLocked}
              >
                <View className="flex-row items-start">
                  <View 
                    className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: `${quest.color}12` }}
                  >
                    {quest.isLocked ? (
                      <Lock size={24} color="#333333" />
                    ) : (
                      <quest.icon size={24} color={quest.color} />
                    )}
                  </View>
                  
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-2">
                      <View 
                        className="px-3 py-1 rounded-xl"
                        style={{ backgroundColor: getDifficultyColor(quest.difficulty) + '15' }}
                      >
                        <Text className="text-xs font-bold" style={{ color: getDifficultyColor(quest.difficulty) }}>
                          {quest.difficulty}
                        </Text>
                      </View>
                      
                      {!quest.isLocked && (
                        <View className="flex-row items-center">
                          <Clock size={12} color="#333333" />
                          <Text className="text-xs font-medium ml-1" style={{ color: '#333333' }}>
                            {quest.duration}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <Text className="text-lg font-bold mb-2" style={{ color: '#004E98' }}>
                      {quest.title}
                    </Text>
                    <Text className="text-sm font-medium mb-4 leading-relaxed" style={{ color: '#333333' }}>
                      {quest.isLocked ? quest.unlockRequirement : quest.description}
                    </Text>
                    
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center space-x-4">
                        <View className="flex-row items-center">
                          <Award size={14} color="#7C9885" />
                          <Text className="text-sm font-bold ml-1" style={{ color: '#7C9885' }}>
                            {quest.points} pts
                          </Text>
                        </View>
                        {!quest.isLocked && (
                          <View className="flex-row items-center">
                            <Users size={14} color="#00A896" />
                            <Text className="text-sm font-medium ml-1" style={{ color: '#00A896' }}>
                              {quest.participants}
                            </Text>
                          </View>
                        )}
                      </View>
                      
                      {!quest.isLocked && (
                        <TouchableOpacity 
                          className="flex-row items-center px-4 py-2 rounded-xl"
                          style={{ backgroundColor: `${quest.color}15` }}
                        >
                          <Play size={14} color={quest.color} />
                          <Text className="text-sm font-bold ml-2" style={{ color: quest.color }}>
                            Start
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Achievements Preview */}
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
          
          <View className="flex-row justify-between">
            {achievements.map((achievement, index) => (
              <View 
                key={index}
                className="flex-1 items-center p-4 mx-1 rounded-2xl"
                style={{ 
                  backgroundColor: 'white',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  borderWidth: 1,
                  borderColor: 'rgba(0, 0, 0, 0.03)',
                  opacity: achievement.earned ? 1 : 0.5
                }}
              >
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
                  className="text-xs font-bold text-center"
                  style={{ color: achievement.earned ? '#004E98' : '#333333' }}
                >
                  {achievement.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-8 right-6 w-14 h-14 rounded-2xl items-center justify-center"
        style={{ 
          backgroundColor: '#7C9885',
          shadowColor: '#7C9885',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16
        }}
      >
        <Target size={24} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};
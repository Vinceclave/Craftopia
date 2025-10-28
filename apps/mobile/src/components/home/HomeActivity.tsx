// apps/mobile/src/components/home/HomeActivity.tsx
import React from 'react';
import { Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Activity, Award, MessageCircle, Heart, TrendingUp, ChevronRight, Trophy, Sparkles } from 'lucide-react-native';

export const HomeActivity = () => {
  // Mock activity data - replace with actual API call
  const activities = [
    {
      id: 1,
      type: 'achievement',
      title: 'First Craft Created',
      description: 'You created your first eco-friendly craft',
      time: '2 hours ago',
      points: 50,
    },
    {
      id: 2,
      type: 'quest',
      title: 'Daily Challenge Complete',
      description: 'Recycling Champion quest finished',
      time: '5 hours ago',
      points: 100,
    },
    {
      id: 3,
      type: 'social',
      title: 'Post Liked',
      description: '12 people liked your craft tutorial',
      time: 'Yesterday',
      points: 0,
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Award size={18} color="#D4A96A" />;
      case 'quest':
        return <Trophy size={18} color="#374A36" />;
      case 'social':
        return <Heart size={18} color="#EF4444" />;
      default:
        return <Activity size={18} color="#6B7280" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return {
          bg: 'rgba(212, 169, 106, 0.1)',
          border: 'rgba(212, 169, 106, 0.2)',
        };
      case 'quest':
        return {
          bg: 'rgba(55, 74, 54, 0.1)',
          border: 'rgba(55, 74, 54, 0.2)',
        };
      case 'social':
        return {
          bg: 'rgba(239, 68, 68, 0.1)',
          border: 'rgba(239, 68, 68, 0.2)',
        };
      default:
        return {
          bg: '#F3F4F6',
          border: '#E5E7EB',
        };
    }
  };

  if (activities.length === 0) {
    return null;
  }

  return (
    <View className="px-6 mb-6">
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View 
            className="w-11 h-11 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: 'rgba(55, 74, 54, 0.1)' }}
          >
            <Activity size={20} color="#374A36" />
          </View>
          <View>
            <Text className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
              Recent Activity
            </Text>
            <Text className="text-xs" style={{ color: '#9CA3AF' }}>
              Your latest achievements
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          className="flex-row items-center px-4 py-2 rounded-full"
          style={{ backgroundColor: '#F3F4F6' }}
          activeOpacity={0.7}
        >
          <Text className="text-xs font-bold mr-1" style={{ color: '#374A36' }}>
            View All
          </Text>
          <ChevronRight size={14} color="#374A36" />
        </TouchableOpacity>
      </View>

      {/* Activity Timeline */}
      <View 
        className="bg-white rounded-2xl overflow-hidden mb-4"
        style={{ 
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {activities.map((activity, index) => (
          <TouchableOpacity
            key={activity.id}
            className="p-5"
            style={{
              borderBottomWidth: index < activities.length - 1 ? 1 : 0,
              borderBottomColor: '#F3F4F6',
            }}
            activeOpacity={0.7}
          >
            <View className="flex-row items-start">
              {/* Icon */}
              <View 
                className="w-11 h-11 rounded-full items-center justify-center mr-4"
                style={{ 
                  backgroundColor: getActivityColor(activity.type).bg,
                  borderWidth: 1,
                  borderColor: getActivityColor(activity.type).border,
                }}
              >
                {getActivityIcon(activity.type)}
              </View>

              {/* Content */}
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-base font-bold flex-1" style={{ color: '#1A1A1A' }}>
                    {activity.title}
                  </Text>
                  {activity.points > 0 && (
                    <View 
                      className="px-3 py-1 rounded-full ml-3"
                      style={{ backgroundColor: 'rgba(212, 169, 106, 0.15)' }}
                    >
                      <Text className="text-xs font-bold" style={{ color: '#D4A96A' }}>
                        +{activity.points}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-sm mb-2" style={{ color: '#6B7280' }}>
                  {activity.description}
                </Text>
                <Text className="text-xs" style={{ color: '#9CA3AF' }}>
                  {activity.time}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Motivational Footer */}
      <View 
        className="rounded-2xl px-4 py-4"
        style={{ 
          backgroundColor: 'rgba(55, 74, 54, 0.05)',
          borderWidth: 1,
          borderColor: 'rgba(55, 74, 54, 0.1)',
        }}
      >
        <View className="flex-row items-center">
          <Sparkles size={18} color="#374A36" />
          <Text className="text-sm font-semibold text-center flex-1 ml-2" style={{ color: '#374A36' }}>
            You're on fire! Keep up the amazing work!
          </Text>
        </View>
      </View>
    </View>
  );
};
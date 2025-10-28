// HomeActivity.tsx - NEW component for recent activities
import React from 'react';
import { Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Activity, Award, MessageCircle, Heart, TrendingUp, ChevronRight } from 'lucide-react-native';

export const HomeActivity = () => {
  // Mock activity data - replace with actual API call
  const activities = [
    {
      id: 1,
      type: 'achievement',
      title: 'First Craft Created',
      description: 'You created your first eco-friendly craft',
      icon: '🎨',
      time: '2 hours ago',
      points: 50,
    },
    {
      id: 2,
      type: 'quest',
      title: 'Daily Challenge Complete',
      description: 'Recycling Champion quest finished',
      icon: '🏆',
      time: '5 hours ago',
      points: 100,
    },
    {
      id: 3,
      type: 'social',
      title: 'Post Liked',
      description: '12 people liked your craft tutorial',
      icon: '❤️',
      time: 'Yesterday',
      points: 0,
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Award size={16} color="#D4A96A" />;
      case 'quest':
        return <TrendingUp size={16} color="#374A36" />;
      case 'social':
        return <Heart size={16} color="#EF4444" />;
      default:
        return <Activity size={16} color="#5D6B5D" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'bg-craftopia-accent/10 border-craftopia-accent/20';
      case 'quest':
        return 'bg-craftopia-primary/10 border-craftopia-primary/20';
      case 'social':
        return 'bg-red-500/10 border-red-500/20';
      default:
        return 'bg-craftopia-light border-craftopia-light';
    }
  };

  if (activities.length === 0) {
    return null;
  }

  return (
    <View className="px-4 mb-6">
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-9 h-9 rounded-full bg-craftopia-primary/10 items-center justify-center mr-2">
            <Activity size={18} color="#374A36" />
          </View>
          <View>
            <Text className="text-lg font-bold text-craftopia-textPrimary">
              Recent Activity
            </Text>
            <Text className="text-xs text-craftopia-textSecondary">
              Your latest achievements
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          className="flex-row items-center"
          activeOpacity={0.7}
        >
          <Text className="text-xs font-semibold text-craftopia-primary mr-1">
            View All
          </Text>
          <ChevronRight size={14} color="#374A36" />
        </TouchableOpacity>
      </View>

      {/* Activity Timeline */}
      <View className="bg-craftopia-surface rounded-xl border border-craftopia-light/50 overflow-hidden">
        {activities.map((activity, index) => (
          <TouchableOpacity
            key={activity.id}
            className={`p-4 ${index < activities.length - 1 ? 'border-b border-craftopia-light/50' : ''}`}
            activeOpacity={0.7}
          >
            <View className="flex-row items-start">
              {/* Icon */}
              <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 border ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </View>

              {/* Content */}
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-sm font-semibold text-craftopia-textPrimary flex-1">
                    {activity.title}
                  </Text>
                  {activity.points > 0 && (
                    <View className="bg-craftopia-accent/10 rounded-full px-2 py-0.5 ml-2">
                      <Text className="text-xs font-bold text-craftopia-accent">
                        +{activity.points}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-xs text-craftopia-textSecondary mb-1">
                  {activity.description}
                </Text>
                <Text className="text-xs text-craftopia-textSecondary/60">
                  {activity.time}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Motivational Footer */}
      <View className="mt-3 bg-gradient-to-r from-craftopia-primary/5 to-craftopia-accent/5 rounded-xl px-3 py-3 border border-craftopia-primary/10">
        <Text className="text-xs font-medium text-craftopia-textPrimary text-center">
          💪 You're on fire! Keep up the amazing work!
        </Text>
      </View>
    </View>
  );
};
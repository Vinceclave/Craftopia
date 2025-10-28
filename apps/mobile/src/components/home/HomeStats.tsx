// apps/mobile/src/components/home/HomeStats.tsx
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Leaf, TrendingUp, Award, ChevronRight, Sparkles } from 'lucide-react-native';
import { useUserStats } from '~/hooks/useUserStats';

export const HomeStats = () => {
  const { data: userStats } = useUserStats();

  const stats = {
    wasteSaved: ((userStats?.points || 0) * 0.1).toFixed(1),
    points: userStats?.points || 0,
    crafts: userStats?.crafts_created || 0,
    challenges: userStats?.challenges_completed || 0,
  };

  return (
    <View className="px-6 pt-6">
      {/* Main Impact Card */}
      <View 
        className="bg-white rounded-3xl p-6 mb-4"
        style={{ 
          shadowColor: '#374A36',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>
              Your Impact
            </Text>
            <Text className="text-sm" style={{ color: '#9CA3AF' }}>
              Keep making a difference! 🌍
            </Text>
          </View>
          <TouchableOpacity 
            className="flex-row items-center px-3 py-2 rounded-full"
            style={{ backgroundColor: '#F3F4F6' }}
            activeOpacity={0.7}
          >
            <Text className="text-xs font-semibold mr-1" style={{ color: '#374A36' }}>
              Details
            </Text>
            <ChevronRight size={14} color="#374A36" />
          </TouchableOpacity>
        </View>

        {/* Primary Stat - Waste Saved */}
        <View 
          className="rounded-2xl p-5 mb-5"
          style={{ 
            backgroundColor: 'rgba(74, 124, 89, 0.08)',
            borderWidth: 1,
            borderColor: 'rgba(74, 124, 89, 0.2)',
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-3">
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: 'rgba(74, 124, 89, 0.15)' }}
                >
                  <Leaf size={20} color="#4A7C59" />
                </View>
                <Text className="text-sm font-semibold" style={{ color: '#6B7280' }}>
                  Waste Saved
                </Text>
              </View>
              <Text className="text-4xl font-bold mb-2" style={{ color: '#374A36' }}>
                {stats.wasteSaved}
                <Text className="text-xl" style={{ color: '#6B7280' }}> kg</Text>
              </Text>
              <View className="flex-row items-center">
                <Sparkles size={14} color="#4A7C59" />
                <Text className="text-xs font-semibold ml-1" style={{ color: '#4A7C59' }}>
                  Amazing progress!
                </Text>
              </View>
            </View>
            
            {/* Decorative Element */}
            <View 
              className="w-24 h-24 rounded-full items-center justify-center"
              style={{ backgroundColor: 'rgba(74, 124, 89, 0.1)' }}
            >
              <Text className="text-5xl">♻️</Text>
            </View>
          </View>
        </View>

        {/* Secondary Stats Grid */}
        <View className="flex-row gap-3">
          {/* Points */}
          <View 
            className="flex-1 rounded-xl p-4"
            style={{ backgroundColor: '#F9FAFB' }}
          >
            <View className="flex-row items-center mb-3">
              <View 
                className="w-8 h-8 rounded-full items-center justify-center mr-2"
                style={{ backgroundColor: 'rgba(212, 169, 106, 0.2)' }}
              >
                <Award size={14} color="#D4A96A" />
              </View>
              <Text className="text-xs font-semibold" style={{ color: '#6B7280' }}>
                Points
              </Text>
            </View>
            <Text className="text-2xl font-bold mb-1" style={{ color: '#374A36' }}>
              {stats.points}
            </Text>
            <Text className="text-xs" style={{ color: '#9CA3AF' }}>
              +{Math.floor(stats.points * 0.1)} today
            </Text>
          </View>

          {/* Crafts */}
          <View 
            className="flex-1 rounded-xl p-4"
            style={{ backgroundColor: '#F9FAFB' }}
          >
            <View className="flex-row items-center mb-3">
              <Text className="text-xl mr-2">🎨</Text>
              <Text className="text-xs font-semibold" style={{ color: '#6B7280' }}>
                Crafts
              </Text>
            </View>
            <Text className="text-2xl font-bold mb-1" style={{ color: '#374A36' }}>
              {stats.crafts}
            </Text>
            <Text className="text-xs" style={{ color: '#9CA3AF' }}>
              Created
            </Text>
          </View>

          {/* Challenges */}
          <View 
            className="flex-1 rounded-xl p-4"
            style={{ backgroundColor: '#F9FAFB' }}
          >
            <View className="flex-row items-center mb-3">
              <Text className="text-xl mr-2">🏆</Text>
              <Text className="text-xs font-semibold" style={{ color: '#6B7280' }}>
                Quests
              </Text>
            </View>
            <Text className="text-2xl font-bold mb-1" style={{ color: '#374A36' }}>
              {stats.challenges}
            </Text>
            <Text className="text-xs" style={{ color: '#9CA3AF' }}>
              Done
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Tip Card */}
      <View 
        className="rounded-2xl px-4 py-4 mb-4"
        style={{ 
          backgroundColor: 'rgba(212, 169, 106, 0.08)',
          borderWidth: 1,
          borderColor: 'rgba(212, 169, 106, 0.2)',
        }}
      >
        <View className="flex-row items-center">
          <View 
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: 'rgba(212, 169, 106, 0.2)' }}
          >
            <TrendingUp size={18} color="#D4A96A" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold mb-1" style={{ color: '#1A1A1A' }}>
              Daily Tip
            </Text>
            <Text className="text-xs" style={{ color: '#6B7280' }}>
              Complete 3 quests today to unlock bonus rewards!
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
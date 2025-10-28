// QuestBanner.tsx - HomeStats structure with Quest content
import React from 'react';
import { Text, View } from 'react-native';
import { Award, CheckCircle, Leaf } from 'lucide-react-native';

interface QuestBannerProps {
  data?: {
    points: number;
    challenges_completed: number;
    total_waste_kg?: number;
  } | null;
  loading: boolean;
}

export const QuestBanner: React.FC<QuestBannerProps> = ({ data, loading }) => {
  const stats = {
    wasteSaved: data?.total_waste_kg?.toFixed(1) || '0.0',
    points: data?.points || 0,
    completed: data?.challenges_completed || 0
  };

  if (loading) {
    return (
      <View className="mx-4 mt-3 mb-4">
        <View className="bg-craftopia-surface rounded-xl px-5 py-4 border border-craftopia-light/50">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <View className="w-20 h-3 bg-craftopia-light rounded mb-2" />
              <View className="w-16 h-6 bg-craftopia-light rounded mb-2" />
              <View className="w-10 h-1 bg-craftopia-light rounded-full" />
            </View>
            
            <View className="flex-row gap-1.5">
              <View className="items-center">
                <View className="w-8 h-8 rounded-full bg-craftopia-light mb-1" />
                <View className="w-8 h-2 bg-craftopia-light rounded" />
              </View>
              <View className="items-center">
                <View className="w-8 h-8 rounded-full bg-craftopia-light mb-1" />
                <View className="w-8 h-2 bg-craftopia-light rounded" />
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="mx-4 mt-3 mb-4">
      <View className="bg-craftopia-surface rounded-xl px-5 py-4 border border-craftopia-light/50">
        <View className="flex-row justify-between items-start">
          {/* Left side - Primary metric (Waste Saved) */}
          <View className="flex-1">
            <Text className="text-xs font-medium text-craftopia-textSecondary uppercase tracking-wider mb-1">
              Waste Saved
            </Text>
            <Text className="text-2xl font-bold text-craftopia-primary mb-1.5">
              {stats.wasteSaved}kg
            </Text>
            <View className="w-10 h-1 bg-craftopia-accent rounded-full" />
          </View>
          
          {/* Right side - Secondary stats */}
          <View className="flex-row gap-1.5">
            {/* Points */}
            <View className="items-center">
              <View className="w-8 h-8 rounded-full bg-craftopia-primary/10 items-center justify-center mb-1">
                <Text className="text-base font-bold text-craftopia-primary">
                  {stats.points}
                </Text>
              </View>
              <Text className="text-xs text-craftopia-textSecondary">Points</Text>
            </View>
            
            {/* Completed Quests */}
            <View className="items-center">
              <View className="w-8 h-8 rounded-full bg-craftopia-success/10 items-center justify-center mb-1">
                <Text className="text-base font-bold text-craftopia-success">
                  {stats.completed}
                </Text>
              </View>
              <Text className="text-xs text-craftopia-textSecondary">Done</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
// HomeHeader.tsx - REDESIGNED with modern gradient and compact layout
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Bell, Trophy } from 'lucide-react-native';
import { useCurrentUser } from '~/hooks/useAuth';
import { useUserStats } from '~/hooks/useUserStats';

export const HomeHeader = () => {
  const { data: user } = useCurrentUser();
  const { data: userStats } = useUserStats();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";

  return (
    <View className="bg-craftopia-surface border-b border-craftopia-light/30">
      {/* Top Bar */}
      <View className="px-4 p-3">
        <View className="flex-row justify-between items-start mb-4">
          {/* Greeting Section */}
          <View className="flex-1">
            <Text className="text-xs text-craftopia-textSecondary uppercase tracking-wider mb-1">
              Good {greeting} 🌱
            </Text>
            <Text className="text-2xl font-bold text-craftopia-textPrimary">
              {user?.username || 'Crafter'}
            </Text>
          </View>
          
          {/* Actions */}
          <View className="flex-row items-center gap-2">
            {/* Notifications */}
            <TouchableOpacity className="relative">
              <View className="w-10 h-10 rounded-full bg-craftopia-light items-center justify-center">
                <Bell size={20} color="#374A36" />
              </View>
              <View className="absolute -top-1 -right-1 w-3 h-3 bg-craftopia-accent rounded-full border-2 border-craftopia-surface" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};
// apps/mobile/src/components/home/HomeHeader.tsx
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Bell, Search, User } from 'lucide-react-native';
import { useCurrentUser } from '~/hooks/useAuth';
import { useUserStats } from '~/hooks/useUserStats';

export const HomeHeader = () => {
  const { data: user } = useCurrentUser();
  const { data: userStats } = useUserStats();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";

  return (
    <View 
      className="bg-white border-b px-6 pt-4 pb-4"
      style={{ 
        borderBottomColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View className="flex-row justify-between items-center">
        {/* Greeting Section */}
        <View className="flex-1">
          <Text className="text-xs uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>
            Good {greeting} 🌱
          </Text>
          <Text className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
            {user?.username || 'Crafter'}
          </Text>
        </View>
        
        {/* Actions */}
        <View className="flex-row items-center gap-3">
          {/* Search Button */}
          <TouchableOpacity 
            className="w-11 h-11 rounded-full items-center justify-center"
            style={{ backgroundColor: '#F3F4F6' }}
            activeOpacity={0.7}
          >
            <Search size={20} color="#374A36" />
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity 
            className="relative w-11 h-11 rounded-full items-center justify-center"
            style={{ backgroundColor: '#F3F4F6' }}
            activeOpacity={0.7}
          >
            <Bell size={20} color="#374A36" />
            <View 
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
              style={{ backgroundColor: '#DC2626' }}
            >
              <Text className="text-xs font-bold text-white">3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
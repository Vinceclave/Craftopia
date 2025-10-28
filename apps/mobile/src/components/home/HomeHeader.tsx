// HomeHeader.jsx - Optimized for mobile
import React from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { Bell, Sparkles, User } from 'lucide-react-native';
import { useCurrentUser } from '~/hooks/useAuth';

export const HomeHeader = () => {
  const { data: user } = useCurrentUser();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";

  const getMotivationalMessage = () => {
    const messages = [
      "Ready to create something beautiful?",
      "Your next masterpiece awaits!",
      "Transform waste into wonder!",
      "Every craft makes a difference!",
      "Let's build a greener world together!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <View className="px-4 pt-4 pb-4 bg-craftopia-surface border-b border-craftopia-light/30">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1">
          <Text className="text-xs text-craftopia-textSecondary uppercase tracking-wider mb-0.5">
            Good {greeting} 🌱
          </Text>
          <Text className="text-xl font-bold text-craftopia-textPrimary">
            {user?.username || 'Crafter'}
          </Text>
        </View>
        
        <View className="flex-row items-center space-x-2">
          <TouchableOpacity className="relative">
            <View className="w-9 h-9 rounded-full bg-craftopia-light items-center justify-center">
              <Bell size={18} color="#374A36" />
            </View>
            <View className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-craftopia-accent rounded-full border border-craftopia-surface" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Motivational Card */}
      <View className="bg-gradient-to-r from-craftopia-accent/10 to-craftopia-primary/5 rounded-xl px-3 py-3 border border-craftopia-accent/20">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-craftopia-accent/20 items-center justify-center mr-2">
            <Sparkles size={16} color="#D4A96A" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-craftopia-textPrimary mb-0.5">
              {getMotivationalMessage()}
            </Text>
            <Text className="text-xs text-craftopia-textSecondary">
              Complete today's quests to unlock rewards
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
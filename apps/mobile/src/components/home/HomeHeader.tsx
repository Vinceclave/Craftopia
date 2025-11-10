import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
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
    <View className="px-5 pt-10 pb-4 bg-craftopia-surface">
      {/* Main Header Row */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1">
          <Text className="text-xs font-nunito text-craftopa-textSecondary tracking-wide mb-0.5">
            {`Good ${greeting} 🌱`}
          </Text>
          <Text className="text-xl font-poppinsBold text-craftopa-textPrimary tracking-tight">
            {String(user?.username || 'Crafter')}
          </Text>
        </View>
        
        <View className="flex-row items-center space-x-2">
          <TouchableOpacity className="relative active:opacity-70">
            <View className="w-9 h-9 rounded-lg bg-white items-center justify-center shadow-sm border border-craftopa-light/10">
              <Bell size={18} color="#5A7160" />
            </View>
            <View className="absolute -top-1 -right-1 w-2 h-2 bg-craftopa-accent rounded-full border border-craftopa-surface shadow-sm" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Motivational Card */}
      <View className="bg-white rounded-xl px-3 py-3 shadow-sm border border-craftopa-light/5">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-lg bg-craftopa-accent/10 items-center justify-center mr-2">
            <Sparkles size={16} color="#5A7160" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-poppinsBold text-craftopa-textPrimary mb-0.5 tracking-tight">
              {String(getMotivationalMessage())}
            </Text>
            <Text className="text-xs font-nunito text-craftopa-textSecondary tracking-wide">
              Complete today's quests to unlock rewards
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
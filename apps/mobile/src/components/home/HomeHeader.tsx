// HomeHeader.jsx - Enhanced with user avatar and better layout
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
    <View className="px-5 pt-6 pb-6 bg-craftopia-surface border-b border-craftopia-light/30">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-1">
          <Text className="text-sm text-craftopia-textSecondary uppercase tracking-wider mb-1">
            Good {greeting} 🌱
          </Text>
          <Text className="text-2xl font-bold text-craftopia-textPrimary">
            {user?.username || 'Crafter'}
          </Text>
        </View>
        
        <View className="flex-row items-center space-x-3">
          <TouchableOpacity className="relative">
            <View className="w-10 h-10 rounded-full bg-craftopia-light items-center justify-center">
              <Bell size={20} className="text-craftopia-primary" />
            </View>
            <View className="absolute top-0 right-0 w-3 h-3 bg-craftopia-accent rounded-full border-2 border-craftopia-surface" />
          </TouchableOpacity>
          
          <TouchableOpacity className="w-10 h-10 rounded-full bg-gradient-to-r from-craftopia-primary to-craftopia-primaryLight items-center justify-center">
            {user?.avatar ? (
              <Image 
                source={{ uri: user.avatar }} 
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <User size={20} className="text-craftopia-surface" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Motivational Card */}
      <View className="bg-gradient-to-r from-craftopia-accent/10 to-craftopia-primary/5 rounded-2xl px-4 py-4 border border-craftopia-accent/20">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-craftopia-accent/20 items-center justify-center mr-3">
            <Sparkles size={18} className="text-craftopia-accent" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-craftopia-textPrimary mb-1">
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
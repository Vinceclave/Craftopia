// HomeHeader.tsx
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Bell, Sparkles, Sun, Moon } from 'lucide-react-native';

export const HomeHeader = () => {
  const today = new Date();
  const hour = today.getHours();

  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const getGreeting = () => {
    if (hour < 12) return { text: 'Good Morning', icon: Sun };
    if (hour < 18) return { text: 'Good Afternoon', icon: Sun };
    return { text: 'Good Evening', icon: Moon };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const inspirations = [
    "Ready to create something beautiful?",
    "What will you craft today?",
    "Let your creativity flow naturally",
    "Every idea starts with imagination",
    "Your next masterpiece awaits"
  ];

  const todayInspiration = inspirations[today.getDate() % inspirations.length];

  return (
    <View className="px-4 pt-4 bg-craftopia-surface border-b border-craftopia-light pb-16">
      {/* Header Row */}
      <View className="flex-row justify-between items-center mb-4">
        {/* Left: Greeting & Date */}
        <View className="flex-1">
          <View className="flex-row items-center mb-1 gap-2">
            <GreetingIcon size={16} className="text-craftopia-primary" />
            <Text className="text-base font-semibold text-craftopia-textPrimary">
              {greeting.text}
            </Text>
          </View>
          <Text className="text-sm text-craftopia-textSecondary">
            {formattedDate}
          </Text>
        </View>

        {/* Right: Notification */}
        <TouchableOpacity 
          activeOpacity={0.8} 
          className="relative bg-craftopia-light rounded-full p-2"
        >
          <Bell size={16} className="text-craftopia-primary" />
          <View className="absolute top-1 right-1 w-2 h-2 bg-craftopia-accent rounded-full" />
        </TouchableOpacity>
      </View>

      {/* Inspiration Section */}
      <View className="bg-craftopia-light rounded-lg p-3">
        <View className="flex-row items-start">
          <View className="bg-craftopia-accent/20 rounded-md p-1.5 mr-3">
            <Sparkles size={14} className="text-craftopia-accent" />
          </View>
          <View className="flex-1">
            <Text className="text-xs uppercase tracking-wide font-medium text-craftopia-textSecondary mb-1">
              Today's Inspiration
            </Text>
            <Text className="text-sm text-craftopia-textPrimary font-medium">
              {todayInspiration}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
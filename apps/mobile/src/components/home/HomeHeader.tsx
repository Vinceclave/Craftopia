import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Bell, Sparkles, Sun, Moon } from 'lucide-react-native';
import { useCurrentUser } from '~/hooks/useAuth';

export const HomeHeader = () => {
  // Get user data from TanStack Query
  const { data: user, isLoading, error } = useCurrentUser();

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

  // Handle loading state
  if (isLoading) {
    return (
      <View className="px-4 pt-4 bg-craftopia-surface border-b border-craftopia-light pb-16">
        <View className="flex-row justify-between items-center mb-4">
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
          
          <TouchableOpacity 
            activeOpacity={0.8} 
            className="relative bg-craftopia-light rounded-full p-2"
          >
            <Bell size={16} className="text-craftopia-primary" />
          </TouchableOpacity>
        </View>

        {/* Loading skeleton for inspiration */}
        <View className="bg-craftopia-light rounded-lg p-3">
          <View className="flex-row items-start">
            <View className="bg-craftopia-accent/20 rounded-md p-1.5 mr-3">
              <Sparkles size={14} className="text-craftopia-accent" />
            </View>
            <View className="flex-1">
              <Text className="text-xs uppercase tracking-wide font-medium text-craftopia-textSecondary mb-1">
                Loading...
              </Text>
              <View className="h-4 bg-craftopia-textSecondary/20 rounded w-3/4" />
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Handle error state
  if (error) {
    return (
      <View className="px-4 pt-4 bg-craftopia-surface border-b border-craftopia-light pb-16">
        <View className="flex-row justify-between items-center mb-4">
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
          
          <TouchableOpacity 
            activeOpacity={0.8} 
            className="relative bg-craftopia-light rounded-full p-2"
          >
            <Bell size={16} className="text-craftopia-primary" />
          </TouchableOpacity>
        </View>

        <View className="bg-craftopia-light rounded-lg p-3">
          <Text className="text-sm text-craftopia-textPrimary">
            Welcome! Let's start crafting.
          </Text>
        </View>
      </View>
    );
  }

  // Safe access to user data with fallbacks
  const username = user?.username || 'Crafter';
  const userPoints = user?.profile?.points || 0;

  return (
    <View className="px-4 pt-4 bg-craftopia-surface border-b border-craftopia-light pb-16">
      {/* Header Row */}
      <View className="flex-row justify-between items-center mb-4">
        {/* Left: Greeting & Date */}
        <View className="flex-1">
          <View className="flex-row items-center mb-1 gap-2">
            <GreetingIcon size={16} className="text-craftopia-primary" />
            <Text className="text-base font-semibold text-craftopia-textPrimary">
              {greeting.text}, {username}!
            </Text>
          </View>
          <Text className="text-sm text-craftopia-textSecondary">
            {formattedDate}
          </Text>
          {userPoints > 0 && (
            <Text className="text-xs text-craftopia-accent font-medium mt-0.5">
              {userPoints} points earned
            </Text>
          )}
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
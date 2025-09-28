// components/home/HomeHeader.tsx
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Bell, Sparkles, Sun, Moon } from 'lucide-react-native';

interface HomeHeaderProps {
  user: {
    username: string;
    profile?: {
      full_name?: string;
    };
  };
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ user }) => {
  const today = new Date();
  const hour = today.getHours();

  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
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
    "Every idea starts with imagination"
  ];

  const todayInspiration = inspirations[today.getDate() % inspirations.length];

  return (
    <View className="px-4 pt-4 bg-craftopia-surface border-b border-craftopia-light" style={{paddingBlockEnd: 60 }}>
      {/* Header Row */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-1">
          <View className="flex-row items-center mb-1 gap-2">
            <GreetingIcon size={18} className="text-craftopia-accent" />
            <Text className="text-base font-semibold text-craftopia-textPrimary">
              {greeting.text}, {user.profile?.full_name || user.username}
            </Text>
          </View>
          <Text className="text-sm text-craftopia-textSecondary">
            {formattedDate}
          </Text>
        </View>

        <TouchableOpacity 
          activeOpacity={0.8} 
          className="relative bg-craftopia-primary/10 rounded-full p-2"
        >
          <Bell size={18} className="text-craftopia-primary" />
          <View className="absolute top-1 right-1 w-2 h-2 bg-craftopia-warning rounded-full" />
        </TouchableOpacity>
      </View>

      {/* Inspiration Section */}
      <View className="bg-craftopia-primaryLight/10 rounded-lg p-3 border border-craftopia-primaryLight/30">
        <View className="flex-row items-center">
          <View className="bg-craftopia-accent/30 rounded p-2 mr-3">
            <Sparkles size={16} className="text-craftopia-accent" />
          </View>
          <View className="flex-1">
            <Text className="text-xs uppercase tracking-wide font-medium text-craftopia-primary mb-1">
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

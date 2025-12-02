// UserChallengesHeader.tsx - Redesigned to match HomeHeader style
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { ArrowLeft, Trophy } from 'lucide-react-native';

interface UserChallengesHeaderProps {
  navigation: any;
}

export const UserChallengesHeader = ({ navigation }: UserChallengesHeaderProps) => {
  return (
    <View 
      className="px-4 pt-6 pb-3 bg-craftopia-surface border-b border-craftopia-light"
      accessibilityLabel="My Quests header"
    >
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1 flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="w-9 h-9 rounded-full bg-craftopia-light items-center justify-center mr-3"
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ArrowLeft size={18} color="#3B6E4D" />
          </TouchableOpacity>
          
          <View className="flex-1">
            <Text 
              className="text-xs text-craftopia-textSecondary mb-0.5 font-nunito"
              accessibilityLabel="My Progress"
              numberOfLines={1}
            >
              My Progress
            </Text>
            <Text 
              className="text-lg font-poppinsBold text-craftopia-textPrimary"
              accessibilityLabel="Quest Activity"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Quest Activity
            </Text>
          </View>
        </View>
      </View>

      {/* Info Card - Same style as Home */}
      <View 
        className="mx-4 bg-craftopia-light rounded-xl p-3 border border-craftopia-light"
        accessibilityLabel="Motivational message"
        accessibilityRole="summary"
      >
        <View className="flex-row items-center">
          <View 
            className="w-9 h-9 rounded-lg bg-craftopia-primary/10 items-center justify-center mr-3 border border-craftopia-primary/20"
            accessibilityLabel="Trophy icon"
          >
            <Trophy size={18} color="#3B6E4D" />
          </View>
          <View className="flex-1">
            <Text 
              className="text-sm font-poppinsBold text-craftopia-textPrimary mb-1"
              accessibilityLabel="Track your challenge journey"
              numberOfLines={2}
            >
              Track your challenge journey
            </Text>
            <Text 
              className="text-xs text-craftopia-textSecondary font-nunito"
              accessibilityLabel="View all your active and completed quests"
              numberOfLines={1}
            >
              View all your active and completed quests
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
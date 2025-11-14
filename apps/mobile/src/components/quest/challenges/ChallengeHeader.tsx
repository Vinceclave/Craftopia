// UserChallengesHeader.tsx - Redesigned to match HomeHeader style
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { ArrowLeft, Trophy, Sparkles } from 'lucide-react-native';

interface UserChallengesHeaderProps {
  navigation: any;
}

export const UserChallengesHeader = ({ navigation }: UserChallengesHeaderProps) => {
  return (
    <View className="px-4 pt-4 pb-4 bg-craftopia-surface border-b border-craftopia-light">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1 flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="w-9 h-9 rounded-full bg-craftopia-light items-center justify-center mr-3"
          >
            <ArrowLeft size={18} color="#3B6E4D" />
          </TouchableOpacity>
          
          <View className="flex-1">
            <Text className="text-xs text-craftopia-textSecondary uppercase tracking-wider mb-0.5 font-nunito">
              My Progress
            </Text>
            <Text className="text-xl font-bold text-craftopia-textPrimary font-poppinsBold">
              Quest Activity
            </Text>
          </View>
        </View>
      </View>

      {/* Info Card - Same style as Home */}
      <View className="bg-craftopia-light rounded-xl px-3 py-3 border border-craftopia-accent/20">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-craftopia-accent/20 items-center justify-center mr-2">
            <Trophy size={16} color="#E6B655" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-craftopia-textPrimary mb-0.5 font-poppinsBold">
              Track your challenge journey
            </Text>
            <Text className="text-xs text-craftopia-textSecondary font-nunito">
              View all your active and completed quests
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
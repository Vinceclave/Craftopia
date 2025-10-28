// QuestHeader.tsx - Redesigned to match HomeHeader style
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { ArrowLeft, Trophy, Sparkles } from 'lucide-react-native';
import { useCurrentUser } from '~/hooks/useAuth';

interface QuestHeaderProps {
  navigation: any;
}

export const QuestHeader = ({ navigation }: QuestHeaderProps) => {
  const { data: user } = useCurrentUser();

  return (
    <View className="px-4 pt-4 pb-4 bg-craftopia-surface border-b border-craftopia-light/30">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1 flex-row items-center">
          <View className="flex-1">
            <Text className="text-xs text-craftopia-textSecondary uppercase tracking-wider mb-0.5">
              Quest Hub 🎯
            </Text>
            <Text className="text-xl font-bold text-craftopia-textPrimary">
              Daily Challenges
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('UserChallenges')}
          className="flex-row items-center bg-craftopia-accent/10 rounded-full px-3 py-2"
        >
          <Trophy size={14} color="#D4A96A" />
          <Text className="text-xs font-semibold text-craftopia-accent ml-1">
            My Quests
          </Text>
        </TouchableOpacity>
      </View>

      {/* Motivational Card - Same style as Home */}
      <View className="bg-gradient-to-r from-craftopia-accent/10 to-craftopia-primary/5 rounded-xl px-3 py-3 border border-craftopia-accent/20">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-craftopia-accent/20 items-center justify-center mr-2">
            <Sparkles size={16} color="#D4A96A" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-craftopia-textPrimary mb-0.5">
              Complete challenges, earn rewards!
            </Text>
            <Text className="text-xs text-craftopia-textSecondary">
              Track your progress and make an impact
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
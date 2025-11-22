import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Trophy, Gift } from 'lucide-react-native';

interface QuestHeaderProps {
  navigation: any;
}

export const QuestHeader = ({ navigation }: QuestHeaderProps) => {
  return (
    <View className="px-4 pt-4 pb-4 bg-craftopia-surface border-b border-craftopia-light">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1 flex-row items-center">
          <View className="flex-1">
            <Text className="text-xs text-craftopia-textSecondary uppercase tracking-wider mb-1 font-nunito">
              Quest Hub
            </Text>
            <Text className="text-xl font-bold text-craftopia-textPrimary font-poppinsBold">
              Daily Challenges
            </Text>
          </View>
        </View>
        
        <View className="flex-row gap-2">
          {/* Rewards Button */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('Rewards')}
            className="flex-row items-center bg-craftopia-accent/10 rounded-full px-3 py-2"
          >
            <Gift size={14} color="#E6B655" />
            <Text className="text-xs font-semibold text-craftopia-accent ml-1 font-nunito">
              Rewards
            </Text>
          </TouchableOpacity>

          {/* My Quests Button */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('UserChallenges')}
            className="flex-row items-center bg-craftopia-primary/10 rounded-full px-3 py-2"
          >
            <Trophy size={14} color="#3B6E4D" />
            <Text className="text-xs font-semibold text-craftopia-primary ml-1 font-nunito">
              My Quests
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Motivational Card */}
      <View className="bg-craftopia-light rounded-xl px-3 py-3 border border-craftopia-accent/20">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-craftopia-accent/20 items-center justify-center mr-2">
            <Gift size={16} color="#E6B655" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-craftopia-textPrimary mb-0.5 font-poppinsBold">
              Complete challenges, earn rewards!
            </Text>
            <Text className="text-xs text-craftopia-textSecondary font-nunito">
              Redeem points for exclusive prizes
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

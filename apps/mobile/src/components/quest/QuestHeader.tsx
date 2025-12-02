import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Trophy, Gift } from 'lucide-react-native';

interface QuestHeaderProps {
  navigation: any;
}

export const QuestHeader = ({ navigation }: QuestHeaderProps) => {
  return (
    <View className="px-4 pt-6 pb-4 bg-craftopia-surface border-b border-craftopia-light">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1 flex-row items-center">
          <View className="flex-1">
            <Text 
              className="text-xs font-nunito text-craftopia-textSecondary mb-1"
              accessibilityLabel="Quest Hub"
              numberOfLines={1}
            >
              Quest Hub
            </Text>
            <Text 
              className="text-lg font-poppinsBold text-craftopia-textPrimary"
              accessibilityLabel="Daily Challenges"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Daily Challenges
            </Text>
          </View>
        </View>
        
        <View className="flex-row items-center gap-2">
          {/* Rewards Button */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('Rewards')}
            className="active:opacity-70"
            activeOpacity={0.7}
            accessibilityLabel="View rewards"
            accessibilityRole="button"
          >
            <View className="w-10 h-10 rounded-lg bg-craftopia-light items-center justify-center border border-craftopia-light">
              <Gift 
                size={18} 
                color="#3B6E4D" 
                accessibilityLabel="Rewards icon"
              />
            </View>
          </TouchableOpacity>

          {/* My Quests Button */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('UserChallenges')}
            className="active:opacity-70"
            activeOpacity={0.7}
            accessibilityLabel="View my quests"
            accessibilityRole="button"
          >
            <View className="w-10 h-10 rounded-lg bg-craftopia-light items-center justify-center border border-craftopia-light">
              <Trophy 
                size={18} 
                color="#3B6E4D" 
                accessibilityLabel="My quests icon"
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Motivational Card */}
      <View 
        className="mx-4 bg-craftopia-light rounded-xl p-3 border border-craftopia-light"
        accessibilityLabel="Motivational message"
        accessibilityRole="summary"
      >
        <View className="flex-row items-center">
          <View 
            className="w-9 h-9 rounded-lg bg-craftopia-primary/10 items-center justify-center mr-3 border border-craftopia-primary/20"
            accessibilityLabel="Gift icon"
          >
            <Gift size={18} color="#3B6E4D" />
          </View>
          <View className="flex-1">
            <Text 
              className="text-sm font-poppinsBold text-craftopia-textPrimary mb-1"
              accessibilityLabel="Complete challenges, earn rewards!"
              numberOfLines={2}
            >
              Complete challenges, earn rewards!
            </Text>
            <Text 
              className="text-xs font-nunito text-craftopia-textSecondary"
              accessibilityLabel="Redeem points for exclusive prizes"
              numberOfLines={1}
            >
              Redeem points for exclusive prizes
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
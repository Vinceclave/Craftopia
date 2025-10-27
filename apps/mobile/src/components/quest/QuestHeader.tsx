import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { List } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EcoQuestStackParamList } from '~/navigations/types';

interface QuestHeaderProps {
  navigation: NativeStackNavigationProp<EcoQuestStackParamList>;
}

export const QuestHeader: React.FC<QuestHeaderProps> = ({ navigation }) => {
  const handleSeeChallenges = () => {
    console.log('See Challenges pressed');
    navigation.navigate('UserChallenges');
  };

  return (
    <View className="px-4 py-4 bg-craftopia-surface">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-xl font-bold text-craftopia-textPrimary">
            Eco Quests
          </Text>
          <Text className="text-sm text-craftopia-textSecondary mt-1">
            Complete challenges, make an impact
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleSeeChallenges}
          className="w-10 h-10 items-center justify-center rounded-full bg-craftopia-light"
          activeOpacity={0.7}
        >
          <List size={18} color="#5D6B5D" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
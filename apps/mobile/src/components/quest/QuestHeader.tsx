import React from 'react';
import { View, Text } from 'react-native';
import Button from '../common/Button';
import { List } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EcoQuestStackParamList } from '~/navigations/types';

interface QuestHeaderProps {
  navigation: NativeStackNavigationProp<EcoQuestStackParamList>;
}

export const QuestHeader: React.FC<QuestHeaderProps> = ({ navigation }) => {
  const handleSeeChallenges = () => {
    console.log('See Challenges pressed');
    navigation.navigate('UserChallenges'); // or pass questId if needed
  };

  return (
    <View className="px-4 py-3 border-b border-craftopia-light bg-craftopia-surface">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-base font-semibold text-craftopia-textPrimary">
            Eco Quest
          </Text>
          <Text className="text-xs text-craftopia-textSecondary mt-0.5">
            Complete quests, earn rewards
          </Text>
        </View>

        <Button
          title=""
          onPress={handleSeeChallenges}
          iconOnly
          leftIcon={<List color="#4B5563" size={20} />}
          className="bg-transparent"
        />
      </View>
    </View>
  );
};

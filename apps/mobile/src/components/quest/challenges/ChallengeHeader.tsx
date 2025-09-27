import React from 'react';
import { View, Text } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EcoQuestStackParamList } from '~/navigations/types';
import Button from '~/components/common/Button';

interface UserChallengesHeaderProps {
  navigation: NativeStackNavigationProp<EcoQuestStackParamList>;
}

export const UserChallengesHeader: React.FC<UserChallengesHeaderProps> = ({ navigation }) => {
  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View className="px-4 py-3 border-b border-craftopia-light bg-craftopia-surface">
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Button
            title=""
            onPress={handleGoBack}
            iconOnly
            leftIcon={<ArrowLeft size={20} className="text-craftopia-textSecondary" />}
            className="bg-transparent mr-3"
          />
          <View>
            <Text className="text-base font-semibold text-craftopia-textPrimary">
              Your Challenges
            </Text>
            <Text className="text-sm text-craftopia-textSecondary mt-0.5">
              Track your quests and claim your rewards
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
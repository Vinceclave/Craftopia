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
    navigation.goBack(); // Navigate to previous screen
  };

  return (
    <View className="px-4 py-3 border-b border-craftopia-light bg-craftopia-surface">
      <View className="flex-row items-center">
        {/* Back Button */}
        <Button
          title=""
          onPress={handleGoBack}
          iconOnly
          leftIcon={<ArrowLeft color="#4B5563" size={20} />}
          className="bg-transparent mr-3"
        />

        {/* Header Text */}
        <View>
          <Text className="text-base font-semibold text-craftopia-textPrimary">
            Your Challenges
          </Text>
          <Text className="text-xs text-craftopia-textSecondary mt-0.5">
            Track your quests and claim your rewards
          </Text>
        </View>
      </View>
    </View>
  );
};

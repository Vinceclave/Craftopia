// UserChallengesHeader with Craftopia colors
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EcoQuestStackParamList } from '~/navigations/types';

interface UserChallengesHeaderProps {
  navigation: NativeStackNavigationProp<EcoQuestStackParamList>;
}

export const UserChallengesHeader: React.FC<UserChallengesHeaderProps> = ({ navigation }) => {
  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View className="px-4 py-3 bg-craftopia-surface">
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={handleGoBack}
          className="w-8 h-8 items-center justify-center rounded-full bg-craftopia-light mr-3"
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color="#5D6B5D" />
        </TouchableOpacity>
        
        <View className="flex-1">
          <Text className="text-xl font-bold text-craftopia-textPrimary">
            Challenges
          </Text>
          <Text className="text-sm text-craftopia-textSecondary mt-0.5">
            Track your progress and rewards
          </Text>
        </View>
      </View>
    </View>
  );
};
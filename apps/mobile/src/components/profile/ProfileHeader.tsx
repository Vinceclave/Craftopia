import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Share2, Settings } from 'lucide-react-native';

interface ProfileHeaderProps {
  onSharePress: () => void;
  onSettingsPress: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  onSharePress,
  onSettingsPress,
}) => {
  return (
    <View className="bg-craftopia-surface px-4 py-2.5 border-b border-gray-200">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-base font-semibold text-craftopia-textPrimary">
            Profile
          </Text>
          <Text className="text-sm text-craftopia-textSecondary mt-0.5">
            Manage your account
          </Text>
        </View>
        <View className="flex-row gap-1.5 items-center">
          <TouchableOpacity
            onPress={onSharePress}
            className="w-8 h-8 rounded-full items-center justify-center"
          >
            <Share2 size={16} color="#004E98" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSettingsPress}
            className="w-8 h-8 rounded-full items-center justify-center"
          >
            <Settings size={16} color="#004E98" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Share2, Settings } from 'lucide-react-native';

interface ProfileHeaderProps {
  onSharePress: () => void;
  onSettingsPress: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  onSharePress,
  onSettingsPress
}) => {
  return (
    <View className="bg-craftopia-surface px-4 py-3 border-b border-gray-200">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-semibold text-craftopia-textPrimary">Profile</Text>
          <Text className="text-base text-craftopia-textSecondary mt-1">Manage your account</Text>
        </View>
        <View className="flex-row gap-2 items-center">
          <TouchableOpacity onPress={onSharePress} className="w-9 h-9 rounded-full items-center justify-center">
            <Share2 size={18} color="#004E98" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onSettingsPress} className="w-9 h-9 rounded-full items-center justify-center">
            <Settings size={18} color="#004E98" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

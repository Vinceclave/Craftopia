// apps/mobile/src/components/profile/ProfileHeader.tsx
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
    <View className="bg-white px-6 py-4 border-b border-gray-100">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Profile</Text>
          <Text className="text-sm text-gray-600">Manage your account</Text>
        </View>
        <View className="flex-row items-center space-x-3">
          <TouchableOpacity 
            onPress={onSharePress}
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
          >
            <Share2 size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={onSettingsPress}
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
          >
            <Settings size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
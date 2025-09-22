import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Camera } from 'lucide-react-native';

interface AvatarSectionProps {
  avatar?: string;
  onAvatarPress?: () => void;
}

export const AvatarSection: React.FC<AvatarSectionProps> = ({
  avatar = '🧑‍🎨',
  onAvatarPress
}) => {
  return (
    <View className="bg-white mx-4 mt-4 rounded-2xl p-6 border border-gray-100">
      <Text className="text-lg font-bold text-gray-900 mb-4">Profile Photo</Text>
      <View className="items-center">
        <TouchableOpacity onPress={onAvatarPress}>
          <View className="relative">
            <View className="w-20 h-20 bg-blue-100 rounded-2xl items-center justify-center">
              <Text className="text-3xl">{avatar}</Text>
            </View>
            <View className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full items-center justify-center">
              <Camera size={14} color="white" />
            </View>
          </View>
        </TouchableOpacity>
        <Text className="text-sm text-gray-600 mt-3">Tap to change photo</Text>
      </View>
    </View>
  );
};
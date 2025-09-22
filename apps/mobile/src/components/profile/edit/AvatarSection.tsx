import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Camera } from 'lucide-react-native';

interface Props { avatar?: string; onAvatarPress?: () => void; }

export const AvatarSection: React.FC<Props> = ({ avatar = '🧑‍🎨', onAvatarPress }) => {
  const isEmoji = avatar.length <= 2;
  return (
    <View className="bg-craftopia-surface rounded-2xl p-6 border border-craftopia-light shadow mt-4">
      <Text className="text-lg font-bold text-craftopia-textPrimary mb-4">Profile Photo</Text>
      <View className="items-center">
        <TouchableOpacity onPress={onAvatarPress}>
          <View className="relative">
            <View className="w-24 h-24 bg-craftopia-light rounded-2xl items-center justify-center overflow-hidden">
              {isEmoji ? <Text className="text-xl">{avatar}</Text> :
                <Image source={{ uri: avatar }} className="w-full h-full rounded-2xl" resizeMode="cover" />}
            </View>
            <View className="absolute -bottom-1 -right-1 w-8 h-8 bg-craftopia-primary rounded-full items-center justify-center">
              <Camera size={14} color="white" />
            </View>
          </View>
        </TouchableOpacity>
        <Text className="text-sm text-craftopia-textSecondary mt-3">Tap to change photo</Text>
      </View>
    </View>
  );
};

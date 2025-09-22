import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

interface Props { onBackPress: () => void; }

export const EditProfileHeader: React.FC<Props> = ({ onBackPress }) => (
  <View className="bg-craftopia-surface px-4 py-3 border-b border-gray-200">
    <View className="flex-row items-center">
      <TouchableOpacity onPress={onBackPress} className="w-9 h-9 rounded-full items-center justify-center mr-3 hover:bg-craftopia-light">
        <ArrowLeft size={18} color="#004E98" />
      </TouchableOpacity>
      <View>
        <Text className="text-lg font-semibold text-craftopia-textPrimary">Edit Profile</Text>
        <Text className="text-base text-craftopia-textSecondary mt-1">Update your information</Text>
      </View>
    </View>
  </View>
);

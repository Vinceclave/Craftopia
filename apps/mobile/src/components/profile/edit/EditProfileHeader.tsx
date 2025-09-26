import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

interface Props { onBackPress: () => void; }

export const EditProfileHeader: React.FC<Props> = ({ onBackPress }) => (
  <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light">
    <View className="flex-row items-center">
      <TouchableOpacity onPress={onBackPress} className="w-8 h-8 rounded-full items-center justify-center mr-2 bg-craftopia-light">
        <ArrowLeft size={16} color="#004E98" />
      </TouchableOpacity>
      <View>
        <Text className="text-sm font-semibold text-craftopia-textPrimary">Edit Profile</Text>
        <Text className="text-xs text-craftopia-textSecondary">Update your information</Text>
      </View>
    </View>
  </View>
);

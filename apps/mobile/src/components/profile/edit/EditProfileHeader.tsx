import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

interface Props { onBackPress: () => void; }

export const EditProfileHeader: React.FC<Props> = ({ onBackPress }) => (
  <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light">
    <View className="flex-row items-center">
      <TouchableOpacity 
        onPress={onBackPress} 
        className="w-9 h-9 rounded-lg items-center justify-center mr-3 bg-craftopia-light"
      >
        <ArrowLeft size={16} color="#3B6E4D" />
      </TouchableOpacity>
      <View>
        <Text className="text-base font-poppinsBold text-craftopia-textPrimary">Edit Profile</Text>
        <Text className="text-xs font-nunito text-craftopia-textSecondary">Update your information</Text>
      </View>
    </View>
  </View>
);
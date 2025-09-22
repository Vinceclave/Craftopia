import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

interface EditProfileHeaderProps {
  onBackPress: () => void;
  onSavePress: () => void;
  loading: boolean;
}

export const EditProfileHeader: React.FC<EditProfileHeaderProps> = ({
  onBackPress,
  onSavePress,
  loading
}) => {
  return (
    <View className="bg-white px-6 py-4 border-b border-gray-100">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={onBackPress} 
            className="mr-3 p-1"
          >
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-gray-900">Edit Profile</Text>
            <Text className="text-sm text-gray-600">Update your information</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={onSavePress}
          disabled={loading}
          className={`px-4 py-2 rounded-full ${loading ? 'bg-gray-300' : 'bg-blue-600'}`}
        >
          <Text className={`font-semibold ${loading ? 'text-gray-500' : 'text-white'}`}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
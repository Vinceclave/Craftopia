// apps/mobile/src/screens/Profile.tsx
import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

export const ProfileScreen = () => (
  <SafeAreaView className="flex-1 bg-white px-6">
    <View className="flex-1 justify-center items-center">
      <Text className="text-3xl font-bold">Profile</Text>
      <Text className="text-gray-600 mt-2">Manage your account and preferences here.</Text>
    </View>
  </SafeAreaView>
);

// apps/mobile/src/screens/EcoQuest.tsx
import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

export const EcoQuestScreen = () => (
  <SafeAreaView className="flex-1 bg-white px-6">
    <View className="flex-1 justify-center items-center">
      <Text className="text-3xl font-bold">EcoQuest</Text>
      <Text className="text-gray-600 mt-2">Take eco-challenges and track your progress.</Text>
    </View>
  </SafeAreaView>
);

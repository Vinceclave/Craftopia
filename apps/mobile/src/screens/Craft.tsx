// apps/mobile/src/screens/Craft.tsx
import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

export const CraftScreen = () => (
  <SafeAreaView className="flex-1 bg-white px-6">
    <View className="flex-1 justify-center items-center">
      <Text className="text-3xl font-bold">Craft</Text>
      <Text className="text-gray-600 mt-2">Discover and create crafts from recyclables.</Text>
    </View>
  </SafeAreaView>
);

// apps/mobile/src/screens/Feed.tsx
import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

export const FeedScreen = () => (
  <SafeAreaView className="flex-1 bg-white px-6">
    <View className="flex-1 justify-center items-center">
      <Text className="text-3xl font-bold">Feed</Text>
      <Text className="text-gray-600 mt-2">Community updates and posts will appear here.</Text>
    </View>
  </SafeAreaView>
);

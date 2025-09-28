// apps/mobile/src/navigations/BotIcon.tsx
import React from 'react';
import { View } from 'react-native';

export default function BotIcon() {
  return (
    <View className="w-8 h-8 items-center justify-center">
      {/* Bot head */}
      <View className="w-6 h-5 bg-white rounded-lg mb-0.5">
        {/* Eyes */}
        <View className="flex-row justify-around items-center flex-1 px-1">
          <View className="w-1 h-1 bg-craftopia-primary rounded-full" />
          <View className="w-1 h-1 bg-craftopia-primary rounded-full" />
        </View>
      </View>
      
      {/* Bot body */}
      <View className="w-5 h-2 bg-white rounded" />
      
      {/* Antenna */}
      <View className="absolute -top-0.5 left-3.5 w-0.5 h-1.5 bg-white">
        <View className="absolute -top-0.5 -left-0.5 w-1 h-1 bg-white rounded-full" />
      </View>
    </View>
  );
}

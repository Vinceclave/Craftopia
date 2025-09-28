// apps/mobile/src/components/home/HomeStats.tsx
import React from 'react';
import { View } from 'react-native';
import { TrendingUp } from 'lucide-react-native';

export const HomeStatsSkeleton = () => {
  return (
    <View
      style={{ marginTop: -40 }}
      className="mx-4 bg-craftopia-primary rounded-2xl p-4 border border-craftopia-light"
    >
      <View className="flex-row items-center">
        {/* Left: Waste Saved skeleton */}
        <View className="flex-row items-center flex-1">
          <View className="mr-3 bg-craftopia-secondary/20 p-2 rounded-full">
            <TrendingUp size={20} color="#888" />
          </View>
          <View>
            <View className="h-4 w-20 bg-craftopia-secondary/30 rounded-md mb-2 animate-pulse" />
            <View className="h-3 w-16 bg-craftopia-secondary/20 rounded-md animate-pulse" />
          </View>
        </View>

        {/* Right: Stats skeleton */}
        <View className="flex-row items-center gap-3">
          {/* Points */}
          <View className="items-center bg-craftopia-secondary/20 p-2 rounded-lg">
            <View className="h-4 w-12 bg-craftopia-secondary/40 rounded-md mb-1 animate-pulse" />
            <View className="h-3 w-10 bg-craftopia-secondary/20 rounded-md animate-pulse" />
          </View>

          {/* Crafts */}
          <View className="items-center bg-craftopia-secondary/20 p-2 rounded-lg">
            <View className="h-4 w-8 bg-craftopia-secondary/40 rounded-md mb-1 animate-pulse" />
            <View className="h-3 w-12 bg-craftopia-secondary/20 rounded-md animate-pulse" />
          </View>
        </View>
      </View>
    </View>
  );
};

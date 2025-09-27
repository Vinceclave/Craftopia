import React from 'react';
import { Text, View } from 'react-native';
import { TrendingUp } from 'lucide-react-native';

export const HomeStats = () => {
  return (
    <View style={{ marginTop: -40 }} className="mx-4 bg-craftopia-primary rounded-2xl p-4 border border-craftopia-light">
      <View className="flex-row items-center">
        {/* Left: Waste Saved */}
        <View className="flex-row items-center flex-1">
          <View className="mr-3 bg-craftopia-secondary/20 p-2 rounded-full">
            <TrendingUp size={20} color='#ffff' />
          </View>
          <View>
            <Text className="text-lg font-extrabold text-craftopia-surface">
              12.5kg
            </Text>
            <Text className="text-xs text-craftopia-surface/80 mt-0.5">
              waste saved
            </Text>
          </View>
        </View>

        {/* Right: Points and Crafts */}
        <View className="flex-row items-center gap-4">
          <View className="items-center bg-craftopia-secondary/20 p-2 rounded-lg">
            <Text className="text-base font-bold text-craftopia-surface">
              2.8k
            </Text>
            <Text className="text-xs text-craftopia-surface/80 uppercase tracking-wide">
              POINTS
            </Text>
          </View>
          
          <View className="items-center bg-craftopia-secondary/20 p-2 rounded-lg">
            <Text className="text-base font-bold text-craftopia-surface">
              23
            </Text>
            <Text className="text-xs text-craftopia-surface/80 uppercase tracking-wide">
              CRAFTS
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
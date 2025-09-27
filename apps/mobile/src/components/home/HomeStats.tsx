import React from 'react';
import { Text, View } from 'react-native';
import { TrendingUp } from 'lucide-react-native';

export const HomeStats = () => {
  return (
    <View style={{ marginTop: -40 }} className="mx-4 bg-craftopia-primary rounded-2xl p-4 border border-craftopia-light">
      <View className="flex-row items-center">
        {/* Left: Waste Saved */}
        <View className="flex-row items-center flex-1">
          <View className="mr-3 bg-craftopia-surface/20 p-2 rounded-full">
            <TrendingUp size={20} className="text-craftopia-light" />
          </View>
          <View>
            <Text className="text-lg font-extrabold text-craftopia-light">
              12.5kg
            </Text>
            <Text className="text-xs text-craftopia-surface/60 mt-0.5">
              waste saved
            </Text>
          </View>
        </View>

        {/* Right: Points and Crafts */}
        <View className="flex-row items-center gap-4">
          <View className="items-center bg-craftopia-light/5 p-2 rounded-lg">
            <Text className="text-base font-bold text-craftopia-accent">
              2.8k
            </Text>
            <Text className="text-xs text-craftopia-accent uppercase tracking-wide">
              POINTS
            </Text>
          </View>
          
          <View className="items-center bg-craftopia-light/5 p-2 rounded-lg">
            <Text className="text-base font-bold text-craftopia-accent">
              23
            </Text>
            <Text className="text-xs text-craftopia-accent uppercase tracking-wide">
              CRAFTS
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
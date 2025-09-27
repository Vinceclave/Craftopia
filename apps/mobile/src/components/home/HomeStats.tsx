import React from 'react';
import { Text, View } from 'react-native';
import { TrendingUp } from 'lucide-react-native';

export const HomeStats = () => {
  return (
    <View style={{ marginTop: -40 }} className="mx-4 bg-craftopia-surface rounded-lg p-4 border border-x-craftopia-accent">
      <View className="flex-row items-center">
        {/* Left: Waste Saved */}
        <View className="flex-row items-center flex-1">
          <View className="mr-3">
            <TrendingUp size={16} color="#6B8E6B" />
          </View>
          <View>
            <Text className="text-lg font-bold text-craftopia-textPrimary">
              12.5kg
            </Text>
            <Text className="text-xs text-craftopia-textSecondary">
              waste saved
            </Text>
          </View>
        </View>

        {/* Right: Points and Crafts */}
        <View className="flex-row">
          <View className="items-center mr-4">
            <Text className="text-base font-bold text-craftopia-primary">
              2.8k
            </Text>
            <Text className="text-xs text-craftopia-textSecondary uppercase tracking-wide">
              POINTS
            </Text>
          </View>
          
          <View className="items-center">
            <Text className="text-base font-bold text-craftopia-accent">
              23
            </Text>
            <Text className="text-xs text-craftopia-textSecondary uppercase tracking-wide">
              CRAFTS
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
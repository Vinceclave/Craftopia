import React from 'react';
import { Text, View } from 'react-native';
import { TrendingUp } from 'lucide-react-native';

interface HomeStatsProps {
  user: {
    points: number;
    profile?: {
      full_name?: string;
    };
  };
}

export const HomeStats: React.FC<HomeStatsProps> = ({ user }) => {
  return (
    <View style={{ marginTop: -40 }} className="mx-4 bg-red-600 rounded-xl p-4 border border-red-500">
      <View className="flex-row items-center justify-between">
        {/* Waste Saved */}
        <View className="flex-row items-center">
          <View className="mr-3 bg-green-400/30 p-2 rounded-full">
            <TrendingUp size={20} className="text-green-300" />
          </View>
          <View>
            <Text className="text-lg font-bold text-orange-50">
              12.5kg
            </Text>
            <Text className="text-xs text-orange-100/80 mt-1">
              waste saved
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row items-center gap-3">
          <View className="items-center bg-orange-400/30 p-2 rounded-lg">
            <Text className="text-base font-bold text-orange-50">
              {user.profile?.points}
            </Text>
            <Text className="text-xs text-orange-100/80 uppercase">
              POINTS
            </Text>
          </View>
          
          <View className="items-center bg-yellow-400/30 p-2 rounded-lg">
            <Text className="text-base font-bold text-orange-50">
              23
            </Text>
            <Text className="text-xs text-orange-100/80 uppercase">
              CRAFTS
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

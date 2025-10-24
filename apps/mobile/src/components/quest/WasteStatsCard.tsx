// apps/mobile/src/components/quest/WasteStatsCard.tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Leaf, Recycle, TrendingUp } from 'lucide-react-native';

interface WasteStatsCardProps {
  data?: {
    total_waste_kg: number;
    total_points: number;
    completed_challenges_count: number;
    waste_by_material: Record<string, number>;
    impact_equivalents: {
      plastic_bottles: number;
      coffee_cups: number;
      cardboard_boxes: number;
      glass_jars: number;
      aluminum_cans: number;
      trees_equivalent: string;
    };
  } | null;
  loading: boolean;
}

export const WasteStatsCard: React.FC<WasteStatsCardProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <View className="mx-4 mt-4 p-4 bg-craftopia-surface rounded-lg border border-craftopia-light">
        <ActivityIndicator size="small" color="#4CAF50" />
      </View>
    );
  }

  if (!data) return null;

  const { total_waste_kg, impact_equivalents, waste_by_material } = data;

  // Get top 3 materials
  const topMaterials = Object.entries(waste_by_material)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <View className="mx-4 mt-4 p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200">
      {/* Header */}
      <View className="flex-row items-center mb-3">
        <View className="p-2 bg-green-100 rounded-full">
          <Recycle size={18} className="text-green-600" />
        </View>
        <View className="ml-3">
          <Text className="text-lg font-bold text-craftopia-textPrimary">
            Your Environmental Impact
          </Text>
          <Text className="text-xs text-craftopia-textSecondary">
            Every bit counts! 🌍
          </Text>
        </View>
      </View>

      {/* Main Stats */}
      <View className="bg-white/80 rounded-lg p-3 mb-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-xs text-craftopia-textSecondary mb-1">
              Total Waste Saved
            </Text>
            <Text className="text-2xl font-bold text-green-600">
              {total_waste_kg.toFixed(2)} kg
            </Text>
          </View>
          <View className="h-12 w-12 bg-green-100 rounded-full items-center justify-center">
            <Leaf size={24} className="text-green-600" />
          </View>
        </View>
      </View>

      {/* Impact Equivalents */}
      <View className="bg-white/80 rounded-lg p-3 mb-3">
        <Text className="text-sm font-semibold text-craftopia-textPrimary mb-2">
          That's equivalent to:
        </Text>
        <View className="space-y-2">
          {impact_equivalents.plastic_bottles > 0 && (
            <View className="flex-row justify-between items-center">
              <Text className="text-xs text-craftopia-textSecondary">🍾 Plastic bottles</Text>
              <Text className="text-sm font-bold text-green-600">
                {impact_equivalents.plastic_bottles}
              </Text>
            </View>
          )}
          {impact_equivalents.coffee_cups > 0 && (
            <View className="flex-row justify-between items-center">
              <Text className="text-xs text-craftopia-textSecondary">☕ Coffee cups</Text>
              <Text className="text-sm font-bold text-green-600">
                {impact_equivalents.coffee_cups}
              </Text>
            </View>
          )}
          {impact_equivalents.aluminum_cans > 0 && (
            <View className="flex-row justify-between items-center">
              <Text className="text-xs text-craftopia-textSecondary">🥫 Aluminum cans</Text>
              <Text className="text-sm font-bold text-green-600">
                {impact_equivalents.aluminum_cans}
              </Text>
            </View>
          )}
          <View className="flex-row justify-between items-center pt-2 border-t border-craftopia-light">
            <Text className="text-xs text-craftopia-textSecondary">🌳 Trees saved (approx)</Text>
            <Text className="text-sm font-bold text-green-600">
              {impact_equivalents.trees_equivalent}
            </Text>
          </View>
        </View>
      </View>

      {/* Top Materials */}
      {topMaterials.length > 0 && (
        <View className="bg-white/80 rounded-lg p-3">
          <Text className="text-sm font-semibold text-craftopia-textPrimary mb-2">
            Top Materials Recycled
          </Text>
          {topMaterials.map(([material, kg], index) => (
            <View key={material} className="flex-row justify-between items-center mb-1">
              <Text className="text-xs text-craftopia-textSecondary capitalize">
                {index + 1}. {material}
              </Text>
              <Text className="text-xs font-medium text-green-600">
                {(kg as number).toFixed(2)} kg
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Motivational Message */}
      <View className="mt-3 flex-row items-center bg-green-50 p-2 rounded-lg">
        <TrendingUp size={14} className="text-green-600 mr-2" />
        <Text className="text-xs text-green-700 flex-1">
          Keep it up! You're making a real difference! 💚
        </Text>
      </View>
    </View>
  );
};
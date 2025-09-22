import { LucideIcon } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

interface StatItem {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string; // Tailwind bg or gradient class
}

interface StatsGridProps {
  stats: StatItem[];
}

const StatCard: React.FC<StatItem> = ({ label, value, icon: Icon, color }) => (
  <View className="flex-1 mx-1">
    <View className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
      {/* Icon */}
      <View className={`w-8 h-8 rounded-lg items-center justify-center mb-3 ${color}`}>
        <Icon size={16} color="white" />
      </View>
      
      {/* Content */}
      <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </Text>
      <Text className="text-lg font-medium text-gray-900 dark:text-white">
        {value}
      </Text>
    </View>
  </View>
);

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  if (!stats.length) return null;

  const rowPattern = [2, 3]; // First row 2 cards, second row 3 cards
  let cursor = 0;

  return (
    <View className="px-4 py-2">
      {rowPattern.map((cols, rowIndex) => {
        const rowStats = stats.slice(cursor, cursor + cols);
        cursor += cols;

        return (
          <View key={rowIndex} className="flex-row mb-3">
            {rowStats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </View>
        );
      })}
    </View>
  );
};
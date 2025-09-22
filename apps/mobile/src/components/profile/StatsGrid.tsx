// apps/mobile/src/components/profile/StatsGrid.tsx
import React from "react";
import { View, Text } from "react-native";
import { LucideIcon } from "lucide-react-native";

interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: keyof typeof craftopiaColors;
}

interface StatsGridProps {
  stats: StatItem[];
}

const craftopiaColors = {
  primary: "bg-craftopia-primary",
  secondary: "bg-craftopia-secondary",
  accent: "bg-craftopia-accent",
  digital: "bg-craftopia-digital",
  spark: "bg-craftopia-spark",
  growth: "bg-craftopia-growth",
  focus: "bg-craftopia-focus",
  energy: "bg-craftopia-energy",
};

const StatCard: React.FC<StatItem> = ({ label, value, icon: Icon, color }) => (
  <View className="flex-1 mx-1">
    <View className="p-4 rounded-xl bg-craftopia-surface border border-craftopia-light">
      {/* Icon */}
      <View
        className={`w-10 h-10 rounded-lg items-center justify-center mb-3 ${craftopiaColors[color]}`}
      >
        <Icon size={16} color="white" />
      </View>

      {/* Content */}
      <Text className="text-xs text-craftopia-text-secondary mb-1">{label ?? ''}</Text>
      <Text className="text-lg font-medium text-craftopia-text-primary">{value ?? ''}</Text>
    </View>
  </View>
);

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  if (!stats.length) return null;

  const rowPattern = [2, 3]; // first row 2 cards, second row 3 cards
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

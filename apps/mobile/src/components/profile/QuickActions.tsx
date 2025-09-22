// apps/mobile/src/components/profile/QuickActions.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface ActionItem {
  label: string;
  icon: LucideIcon;
  color: keyof typeof craftopiaColors; // semantic color key
  onPress: () => void;
}

interface QuickActionsProps {
  actions: ActionItem[];
}

// Craftopia color palette
const craftopiaColors = {
  primary: "#004E98",
  secondary: "#00A896",
  accent: "#FF6700",
  digital: "#004E98",
  spark: "#FF6700",
  growth: "#10B981",
  focus: "#4F46E5",
  energy: "#FF6B6B",
};

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  return (
    <View className="px-4 mt-6">
      <Text className="text-base font-semibold text-craftopia-text-primary mb-4">
        Quick Actions
      </Text>

      <View className="space-y-3">
        {actions.map((action, index) => (
          <TouchableOpacity 
            key={index}
            onPress={action.onPress}
            className="bg-craftopia-surface px-4 py-3 rounded-xl border border-craftopia-light flex-row items-center active:opacity-70 shadow-sm"
          >
            {/* Icon container */}
            <View
              className="w-10 h-10 rounded-lg items-center justify-center mr-4"
              style={{ backgroundColor: `${craftopiaColors[action.color]}33` }} // 20% opacity
            >
              <action.icon size={18} color={craftopiaColors[action.color]} />
            </View>

            {/* Label */}
            <Text className="flex-1 font-medium text-craftopia-text-primary text-base">
              {action.label ?? ''}
            </Text>

            {/* Arrow */}
            <Text className="text-craftopia-text-secondary text-lg">›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

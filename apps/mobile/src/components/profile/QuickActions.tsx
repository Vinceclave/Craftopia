import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface ActionItem {
  label: string;
  icon: LucideIcon;
  color: keyof typeof craftopiaColors;
  onPress: () => void;
}

interface QuickActionsProps {
  actions: ActionItem[];
}

const craftopiaColors = {
  primary: "#004E98",
  secondary: "#00A896",
  accent: "#FF6700",
  growth: "#10B981",
};

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  return (
    <View className="px-0">
      <Text className="text-lg font-semibold text-craftopia-textPrimary mb-4">Quick Actions</Text>
      <View className="space-y-3">
        {actions.map((action, index) => (
          <TouchableOpacity 
            key={index}
            onPress={action.onPress}
            className="bg-craftopia-surface px-4 py-3 rounded-xl border border-craftopia-light flex-row items-center shadow-sm"
          >
            <View className="w-10 h-10 rounded-lg items-center justify-center mr-4"
              style={{ backgroundColor: `${craftopiaColors[action.color]}33` }}
            >
              <action.icon size={18} color={craftopiaColors[action.color]} />
            </View>
            <Text className="flex-1 text-base font-medium text-craftopia-textPrimary">{action.label}</Text>
            <Text className="text-base text-craftopia-textSecondary">›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

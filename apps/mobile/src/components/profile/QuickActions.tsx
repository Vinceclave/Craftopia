// apps/mobile/src/components/profile/QuickActions.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface ActionItem {
  label: string;
  icon: LucideIcon;
  color: string;
  onPress: () => void;
}

interface QuickActionsProps {
  actions: ActionItem[];
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  return (
    <View className="px-4 mt-6">
      <Text className="text-base font-medium text-gray-900 dark:text-white mb-4">
        Quick Actions
      </Text>
      
      <View className="space-y-2">
        {actions.map((action, index) => (
          <TouchableOpacity 
            key={index}
            onPress={action.onPress}
            className="bg-white dark:bg-gray-900 px-4 py-3 rounded-lg border border-gray-100 dark:border-gray-800 flex-row items-center active:opacity-70"
          >
            <View className="w-8 h-8 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: `${action.color}15` }}>
              <action.icon size={16} color={action.color} />
            </View>
            
            <Text className="flex-1 font-medium text-gray-900 dark:text-white">
              {action.label}
            </Text>
            
            <Text className="text-gray-400 text-lg">›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
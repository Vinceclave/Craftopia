import React from 'react';
import { View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface Props {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<Props> = ({ 
  title, 
  icon: Icon, 
  iconColor, 
  iconBgColor, 
  children 
}) => (
  <View className="bg-craftopia-surface mx-4 mt-2 rounded-lg p-3 border border-craftopia-light/50">
    <View className="flex-row items-center mb-2">
      <View 
        className="w-7 h-7 rounded-full items-center justify-center mr-2" 
        style={{ backgroundColor: iconBgColor }}
      >
        <Icon size={14} color={iconColor} />
      </View>
      <Text className="text-sm font-semibold text-craftopia-textPrimary">{title}</Text>
    </View>
    {children}
  </View>
);
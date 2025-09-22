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

export const FormSection: React.FC<Props> = ({ title, icon: Icon, iconColor, iconBgColor, children }) => (
  <View className="bg-white mx-4 mt-4 rounded-2xl p-6 border border-gray-100">
    <View className="flex-row items-center mb-4">
      <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: iconBgColor }}>
        <Icon size={18} color={iconColor} />
      </View>
      <Text className="text-lg font-bold text-gray-900">{title}</Text>
    </View>
    {children}
  </View>
);

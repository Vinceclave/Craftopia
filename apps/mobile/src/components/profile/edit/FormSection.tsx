import React from 'react';
import { View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface Props {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export const FormSection: React.FC<Props> = ({ 
  title, 
  icon: Icon, 
  children 
}) => (
  <View className="bg-craftopia-surface mx-4 mt-3 rounded-xl p-4 border border-craftopia-light">
    <View className="flex-row items-center mb-3">
      <View className="w-8 h-8 rounded-lg bg-craftopia-primary/10 items-center justify-center mr-3 border border-craftopia-primary/20">
        <Icon size={16} color="#3B6E4D" />
      </View>
      <Text className="text-sm font-poppinsBold text-craftopia-textPrimary">{title}</Text>
    </View>
    {children}
  </View>
);
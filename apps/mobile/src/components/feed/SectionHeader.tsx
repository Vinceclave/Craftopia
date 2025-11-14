import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface SectionHeaderProps {
  title: string;
  icon: React.ReactNode;
  isActive: boolean;
  onPress: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  icon, 
  isActive, 
  onPress 
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className={`mr-3 pb-2 ${isActive ? 'border-b-2 border-craftopia-primary' : ''}`}
  >
    <View className="flex-row items-center">
      {icon}
      <Text
        className={`text-sm font-poppinsBold ml-1.5 ${
          isActive ? 'text-craftopia-primary' : 'text-craftopia-textSecondary'
        }`}
      >
        {title}
      </Text>
    </View>
  </TouchableOpacity>
);
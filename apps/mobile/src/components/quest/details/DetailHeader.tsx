// DetailHeader.tsx - Redesigned to match HomeHeader style
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

interface DetailHeaderProps {
  onBackPress: () => void;
  questId: number;
}

export const DetailHeader = ({ onBackPress, questId }: DetailHeaderProps) => {
  return (
    <View className="px-4 pt-4 pb-3 bg-craftopia-surface border-b border-craftopia-light">
      <View className="flex-row justify-between items-center">
        <View className="flex-1 flex-row items-center">
          <TouchableOpacity 
            onPress={onBackPress}
            className="w-9 h-9 rounded-full bg-craftopia-light items-center justify-center mr-3"
          >
            <ArrowLeft size={18} color="#3B6E4D" />
          </TouchableOpacity>
          
          <View className="flex-1">
            <Text className="text-xs text-craftopia-textSecondary uppercase tracking-wider mb-0.5 font-nunito">
              Quest Details 
            </Text>
            <Text className="text-xl font-bold text-craftopia-textPrimary font-poppinsBold">
              Challenge Info
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
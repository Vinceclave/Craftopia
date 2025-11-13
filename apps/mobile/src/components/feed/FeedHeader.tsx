// apps/mobile/src/components/feed/FeedHeader.tsx - COMPLETE FINAL VERSION
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Search, Filter } from 'lucide-react-native';
import { FeedTabs } from './FeedTabs';
import type { FeedType } from './FeedTabs';

interface FeedHeaderProps {
  activeTab: FeedType;
  onTabChange: (tab: FeedType) => void;
  onSearchPress: () => void;
  onFilterPress: () => void;
  hasActiveFilter: boolean;
}

export const FeedHeader: React.FC<FeedHeaderProps> = ({
  activeTab,
  onTabChange,
  onSearchPress,
  onFilterPress,
  hasActiveFilter,
}) => {
  return (
    <View className="px-5 pt-10 pb-3 bg-white border-b border-[#5A7160]/10">
      {/* Main Header Row */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1">
          <Text className="text-xs font-nunito text-gray-500 tracking-wider mb-0.5">
            Discover
          </Text>
          <Text className="text-xl font-bold font-poppins text-gray-800 tracking-tight">
            Find Inspiration
          </Text>
        </View>
        
        {/* Action Buttons */}
        <View className="flex-row items-center gap-2">
          <TouchableOpacity 
            className={`
              w-9 h-9 rounded-lg items-center justify-center border
              shadow-sm
              ${hasActiveFilter 
                ? 'bg-[#5A7160] border-[#5A7160]/20' 
                : 'bg-white border-[#5A7160]/10'
              }
            `}
            onPress={onFilterPress}
            activeOpacity={0.7}
          >
            <Filter 
              size={16} 
              color={hasActiveFilter ? "#FFFFFF" : "#5A7160"} 
              strokeWidth={2}
            />
            {hasActiveFilter && (
              <View className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#D4A96A] rounded-full border border-white shadow-sm" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="w-9 h-9 rounded-lg items-center justify-center border border-[#5A7160]/10 bg-white shadow-sm"
            onPress={onSearchPress}
            activeOpacity={0.7}
          >
            <Search size={16} color="#5A7160" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Tabs */}
      <FeedTabs 
        activeTab={activeTab} 
        onTabChange={onTabChange} 
      />
    </View>
  );
};

export type { FeedType };
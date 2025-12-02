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
    <View className="px-4 pt-6 pb-3 bg-craftopia-surface border-b border-craftopia-light">
      {/* Main Header Row */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1">
          <Text className="text-xs font-nunito text-craftopia-textSecondary mb-1">
            Discover
          </Text>
          <Text className="text-lg font-poppinsBold text-craftopia-textPrimary">
            Find Inspiration
          </Text>
        </View>
        
        {/* Action Buttons */}
        <View className="flex-row items-center gap-2">
          <TouchableOpacity 
            className={`
              w-9 h-9 rounded-lg items-center justify-center border
              ${hasActiveFilter 
                ? 'bg-craftopia-primary border-craftopia-primary/20' 
                : 'bg-craftopia-surface border-craftopia-light'
              }
            `}
            onPress={onFilterPress}
            activeOpacity={0.7}
          >
            <Filter 
              size={16} 
              color={hasActiveFilter ? "#FFFFFF" : "#3B6E4D"} 
            />
            {hasActiveFilter && (
              <View className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-craftopia-accent rounded-full border-2 border-craftopia-surface" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="w-9 h-9 rounded-lg items-center justify-center border border-craftopia-light bg-craftopia-surface"
            onPress={onSearchPress}
            activeOpacity={0.7}
          >
            <Search size={16} color="#3B6E4D" />
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
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Search, Filter } from 'lucide-react-native';
import { FeedTabs } from './FeedTabs';
import type { FeedType } from '~/hooks/queries/usePosts';

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
    <View className="px-5 pt-10 pb-3 bg-white border-b border-craftopa-light/10">
      {/* Main Header Row */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1">
          <Text className="text-xs font-nunito text-craftopa-textSecondary tracking-wide mb-0.5">
            Discover
          </Text>
          <Text className="text-xl font-poppinsBold text-craftopa-textPrimary tracking-tight">
            Find Inspiration
          </Text>
        </View>
        
        {/* Action Buttons */}
        <View className="flex-row items-center gap-2">
          <TouchableOpacity 
            className={`w-9 h-9 rounded-lg items-center justify-center border active:opacity-70 ${
              hasActiveFilter 
                ? 'bg-craftopa-primary border-craftopa-primary/20' 
                : 'bg-white border-craftopa-light/10'
            } shadow-sm`}
            onPress={onFilterPress}
            activeOpacity={0.7}
          >
            <Filter 
              size={16} 
              color={hasActiveFilter ? "#FFFFFF" : "#5A7160"} 
              strokeWidth={2}
            />
            {hasActiveFilter && (
              <View className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-craftopa-accent rounded-full border border-white shadow-sm" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="w-9 h-9 bg-white border border-craftopa-light/10 rounded-lg items-center justify-center shadow-sm active:opacity-70"
            onPress={onSearchPress}
            activeOpacity={0.7}
          >
            <Search size={16} color="#5A7160" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Tabs */}
      <FeedTabs activeTab={activeTab} onTabChange={onTabChange} />
    </View>
  );
};
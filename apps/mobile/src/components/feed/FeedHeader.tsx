// apps/mobile/src/components/feed/FeedHeader.tsx
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

// Create wrapped TouchableOpacity components
const AnimatedTouchable = React.forwardRef<any, any>((props, ref) => (
  <TouchableOpacity ref={ref} {...props} />
));
AnimatedTouchable.displayName = 'AnimatedTouchable';

export const FeedHeader: React.FC<FeedHeaderProps> = ({
  activeTab,
  onTabChange,
  onSearchPress,
  onFilterPress,
  hasActiveFilter,
}) => {
  return (
    <View className="bg-white p-2 px-4  border-b border-gray-100">
      {/* Main Header Row */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-1">
          <Text className="text-2xl font-semibold text-gray-900">
            Discover
          </Text>
          <Text className="text-sm text-gray-500 mt-0.5 font-normal">
            Find what inspires you
          </Text>
        </View>
        
        {/* Action Buttons */}
        <View className="flex-row items-center gap-2">
          <AnimatedTouchable 
            className={`w-10 h-10 rounded-xl items-center justify-center ${
              hasActiveFilter 
                ? 'bg-black border border-gray-200' 
                : 'bg-gray-50 border border-gray-100'
            }`}
            onPress={onFilterPress}
            activeOpacity={0.8}
          >
            <Filter 
              size={18} 
              color={hasActiveFilter ? "#FFFFFF" : "#374151"} 
              strokeWidth={1.5}
            />
            {hasActiveFilter && (
              <View className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-400 rounded-full border border-white" />
            )}
          </AnimatedTouchable>
          
          <AnimatedTouchable 
            className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl items-center justify-center"
            onPress={onSearchPress}
            activeOpacity={0.8}
          >
            <Search size={18} color="#374151" strokeWidth={1.5} />
          </AnimatedTouchable>
        </View>
      </View>
      
      {/* Tabs */}
      <FeedTabs activeTab={activeTab} onTabChange={onTabChange} />
    </View>
  );
};
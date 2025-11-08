// apps/mobile/src/components/feed/FeedTabs.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LayoutGrid, TrendingUp, Flame, Star } from 'lucide-react-native';
import type { FeedType } from '~/hooks/queries/usePosts';

const FEED_TABS = [
  { key: 'all' as FeedType, label: 'All', icon: LayoutGrid },
  { key: 'trending' as FeedType, label: 'Trending', icon: TrendingUp },
  { key: 'popular' as FeedType, label: 'Popular', icon: Flame },
  { key: 'featured' as FeedType, label: 'Featured', icon: Star },
];

interface FeedTabsProps {
  activeTab: FeedType;
  onTabChange: (tab: FeedType) => void;
}

// Create a wrapped TouchableOpacity component
const AnimatedTouchable = React.forwardRef<any, any>((props, ref) => (
  <TouchableOpacity ref={ref} {...props} />
));
AnimatedTouchable.displayName = 'AnimatedTouchable';

export const FeedTabs: React.FC<FeedTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <View className="flex-row justify-center bg-white/80">
      {FEED_TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const IconComponent = tab.icon;
        return (
          <AnimatedTouchable
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            className={`flex-1 mx-0.5 py-2.5 rounded-xl ${
              isActive ? 'bg-black' : 'bg-transparent'
            }`}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              <IconComponent 
                size={16} 
                color={isActive ? '#FFFFFF' : '#6B7280'} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <Text className={`text-xs font-medium ml-1.5 ${
                isActive ? 'text-white' : 'text-gray-500'
              }`}>
                {tab.label}
              </Text>
            </View>
          </AnimatedTouchable>
        );
      })}
    </View>
  );
};
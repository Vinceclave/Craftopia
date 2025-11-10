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

export const FeedTabs: React.FC<FeedTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <View className="flex-row justify-center bg-white/80 rounded-lg p-1 border border-[#5A7160]/10">
      {FEED_TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const IconComponent = tab.icon;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            className={`
              flex-1 mx-0.5 py-2 rounded-lg
              ${isActive 
                ? 'bg-[#5A7160] shadow-sm' 
                : 'bg-transparent'
              }
            `}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-center">
              <IconComponent 
                size={14} 
                color={isActive ? '#FFFFFF' : '#6B7280'} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <Text className={`
                text-xs font-bold ml-1 tracking-tight
                ${isActive ? 'text-white' : 'text-gray-500'}
              `}>
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
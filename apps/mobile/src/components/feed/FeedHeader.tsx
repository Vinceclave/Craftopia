import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Search, LayoutGrid, TrendingUp, Flame, Star } from 'lucide-react-native';
import { FeedType } from '~/hooks/queries/usePosts';

interface FeedHeaderProps {
  activeTab: FeedType;
  onTabChange: (tab: FeedType) => void;
  onSearchPress: () => void;
}

const FEED_TABS = [
  { key: 'all' as FeedType, label: 'All', icon: LayoutGrid },
  { key: 'trending' as FeedType, label: 'Trending', icon: TrendingUp },
  { key: 'popular' as FeedType, label: 'Popular', icon: Flame },
  { key: 'featured' as FeedType, label: 'Featured', icon: Star },
];

export const FeedHeader: React.FC<FeedHeaderProps> = ({
  activeTab,
  onTabChange,
  onSearchPress,
}) => {
  return (
    <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light/30">
      <View className="flex-row justify-between items-center mb-3">
        <View>
          <Text className="text-lg font-bold text-craftopia-textPrimary">Feed</Text>
          <Text className="text-xs text-craftopia-textSecondary">Discover amazing projects</Text>
        </View>
        <TouchableOpacity 
          className="w-8 h-8 bg-craftopia-light rounded-full items-center justify-center"
          onPress={onSearchPress}
          activeOpacity={0.7}
        >
          <Search size={16} color="#5D6B5D" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {FEED_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const IconComponent = tab.icon;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onTabChange(tab.key)}
              className={`mr-3 pb-2 ${isActive ? 'border-b-2 border-craftopia-primary' : ''}`}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <IconComponent 
                  size={14} 
                  color={isActive ? '#374A36' : '#5D6B5D'}
                />
                <Text 
                  className={`text-sm font-medium ml-1.5 ${
                    isActive ? 'text-craftopia-primary' : 'text-craftopia-textSecondary'
                  }`}
                >
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
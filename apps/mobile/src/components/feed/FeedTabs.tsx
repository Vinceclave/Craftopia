import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LayoutGrid, TrendingUp, Flame, Star } from 'lucide-react-native';

// Define FeedType locally to avoid any import issues
type FeedType = 'all' | 'trending' | 'popular' | 'featured';

interface TabItem {
  key: FeedType;
  label: string;
  icon: React.ComponentType<{ size: number; color: string }>;
}

interface FeedTabsProps {
  activeTab: FeedType;
  onTabChange: (tab: FeedType) => void;
}

const FEED_TABS: TabItem[] = [
  { key: 'all', label: 'All', icon: LayoutGrid },
  { key: 'trending', label: 'Trending', icon: TrendingUp },
  { key: 'popular', label: 'Popular', icon: Flame },
  { key: 'featured', label: 'Featured', icon: Star },
];

export const FeedTabs: React.FC<FeedTabsProps> = React.memo(({ activeTab, onTabChange }) => {
  const handleTabPress = React.useCallback((tabKey: FeedType) => {
    if (typeof onTabChange === 'function') {
      onTabChange(tabKey);
    }
  }, [onTabChange]);

  return (
    <View style={styles.container}>
      {FEED_TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const IconComponent = tab.icon;

        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => handleTabPress(tab.key)}
            style={[
              styles.tab,
              isActive ? styles.tabActive : styles.tabInactive
            ]}
            activeOpacity={0.7}
          >
            <View style={styles.tabContent}>
              <IconComponent 
                size={14} 
                color={isActive ? '#FFFFFF' : '#5F6F64'} 
              />
              <Text 
                style={[
                  styles.tabText,
                  isActive ? styles.tabTextActive : styles.tabTextInactive
                ]}
              >
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

FeedTabs.displayName = 'FeedTabs';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#F5F7F2',
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: '#F5F7F2',
  },
  tab: {
    flex: 1,
    marginHorizontal: 2,
    paddingVertical: 8,
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: '#3B6E4D',
  },
  tabInactive: {
    backgroundColor: 'transparent',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    marginLeft: 4,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabTextInactive: {
    color: '#5F6F64',
  },
});

export type { FeedType };
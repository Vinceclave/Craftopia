// apps/mobile/src/components/feed/FeedTabs.tsx - COMPLETE FINAL VERSION
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LayoutGrid, TrendingUp, Flame, Star } from 'lucide-react-native';

// Define FeedType locally to avoid any import issues
type FeedType = 'all' | 'trending' | 'popular' | 'featured';

interface TabItem {
  key: FeedType;
  label: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
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
                color={isActive ? '#FFFFFF' : '#6B7280'} 
                strokeWidth={isActive ? 2.5 : 2}
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(90, 113, 96, 0.1)',
  },
  tab: {
    flex: 1,
    marginHorizontal: 2,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#5A7160',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: -0.2,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabTextInactive: {
    color: '#6B7280',
  },
});

export type { FeedType };
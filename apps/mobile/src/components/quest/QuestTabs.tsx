// QuestTabs.tsx - Redesigned with cleaner style
import React from 'react';
import { Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Flame, TrendingUp, Calendar, Grid } from 'lucide-react-native';

type QuestType = 'all' | 'daily' | 'weekly' | 'monthly';

interface QuestTabsProps {
  activeTab: QuestType;
  onChangeTab: (tab: QuestType) => void;
}

export const QuestTabs = ({ activeTab, onChangeTab }: QuestTabsProps) => {
  const tabs: Array<{ key: QuestType; label: string; icon: any }> = [
    { key: 'all', label: 'All', icon: Grid },
    { key: 'daily', label: 'Daily', icon: Flame },
    { key: 'weekly', label: 'Weekly', icon: TrendingUp },
    { key: 'monthly', label: 'Monthly', icon: Calendar },
  ];

  return (
    <View className="px-4 py-3 bg-craftopia-background border-b border-craftopia-light">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onChangeTab(tab.key)}
              className={`flex-row items-center px-4 py-2 rounded-full border ${
                isActive
                  ? 'bg-craftopia-primary border-craftopia-primary'
                  : 'bg-craftopia-surface border-craftopia-light'
              }`}
              activeOpacity={0.7}
            >
              <Icon 
                size={16} 
                color={isActive ? '#FFFFFF' : '#5F6F64'} 
              />
              <Text
                className={`text-sm font-semibold ml-1.5 font-nunito ${
                  isActive ? 'text-white' : 'text-craftopia-textSecondary'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
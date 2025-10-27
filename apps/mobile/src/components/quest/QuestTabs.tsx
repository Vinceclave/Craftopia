import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

type QuestType = 'all' | 'daily' | 'weekly' | 'monthly';

interface QuestListsProps {
  activeTab: QuestType;
  onChangeTab: (tab: QuestType) => void;
}

const QUEST_TABS: { key: QuestType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
];

export const QuestTabs: React.FC<QuestListsProps> = ({ activeTab, onChangeTab }) => {
  return (
    <View className=" mt-4 py-3 bg-craftopia-surface">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {QUEST_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onChangeTab(tab.key)}
              activeOpacity={0.7}
              className={`mr-3 px-4 py-2.5 rounded-lg ${
                isActive
                  ? 'bg-craftopia-primary'
                  : 'bg-craftopia-light'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  isActive ? 'text-craftopia-surface' : 'text-craftopia-textSecondary'
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
} 
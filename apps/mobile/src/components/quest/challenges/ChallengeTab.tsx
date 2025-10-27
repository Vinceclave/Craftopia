import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export type QuestType = 'in_progress' | 'pending_verification' | 'rejected' | 'completed';

interface ChallengeTabProps {
  activeTab: QuestType;
  onChangeTab: (tab: QuestType) => void;
}

const QUEST_TABS: { key: QuestType; label: string }[] = [
  { key: 'in_progress', label: 'In Progress' },
  { key: 'pending_verification', label: 'Pending' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'completed', label: 'Completed' },
];

export const ChallengeTab: React.FC<ChallengeTabProps> = ({ activeTab, onChangeTab }) => {
  return (
    <View className="px-4 py-3 bg-craftopia-surface border-b border-craftopia-light">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 12 }}
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
};
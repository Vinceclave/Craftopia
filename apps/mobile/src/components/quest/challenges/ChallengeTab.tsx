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
    <View className="py-2 bg-craftopia-light border-b border-craftopia-light">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4"
      >
        {QUEST_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onChangeTab(tab.key)}
              activeOpacity={0.8}
              className={`mr-2 px-3 py-1.5 rounded-full border ${
                isActive
                  ? 'bg-craftopia-primary border-craftopia-primary'
                  : 'bg-craftopia-surface border-craftopia-light'
              }`}
            >
              <Text
                className={`text-xs ${
                  isActive ? 'text-white font-medium' : 'text-craftopia-textSecondary'
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
// ChallengeTab.tsx - Redesigned to match QuestTabs style
import React from 'react';
import { Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Clock, CheckCircle, XCircle, HourglassIcon } from 'lucide-react-native';

export type QuestType = 'in_progress' | 'pending_verification' | 'rejected' | 'completed';

interface ChallengeTabProps {
  activeTab: QuestType;
  onChangeTab: (tab: QuestType) => void;
}

export const ChallengeTab = ({ activeTab, onChangeTab }: ChallengeTabProps) => {
  const tabs: Array<{ key: QuestType; label: string; icon: any }> = [
    { key: 'in_progress', label: 'In Progress', icon: Clock },
    { key: 'pending_verification', label: 'Pending', icon: HourglassIcon },
    { key: 'completed', label: 'Completed', icon: CheckCircle },
    { key: 'rejected', label: 'Rejected', icon: XCircle },
  ];

  return (
    <View className="px-4 py-3 bg-craftopia-light border-b border-craftopia-light/50">
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
                  : 'bg-craftopia-surface border-craftopia-light/50'
              }`}
              activeOpacity={0.7}
            >
              <Icon 
                size={16} 
                color={isActive ? '#FFFFFF' : '#5D6B5D'} 
              />
              <Text
                className={`text-sm font-semibold ml-1.5 ${
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
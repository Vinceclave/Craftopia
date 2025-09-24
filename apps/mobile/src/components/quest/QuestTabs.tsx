import React from 'react'
import { ScrollView, Text, TouchableOpacity } from 'react-native'

type QuestType = 'all' | 'daily' | 'weekly' | 'monthly'

interface QuestListsProps {
  activeTab: QuestType
  onChangeTab: (tab: QuestType) => void
}

const QUEST_TABS: { key: QuestType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
]

export const QuestTabs: React.FC<QuestListsProps> = ({ activeTab, onChangeTab }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-4 py-2"
    >
      {QUEST_TABS.map((tab) => {
        const isActive = activeTab === tab.key
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
            <Text className={`text-xs ${isActive ? 'text-white font-medium' : 'text-craftopia-textSecondary'}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}
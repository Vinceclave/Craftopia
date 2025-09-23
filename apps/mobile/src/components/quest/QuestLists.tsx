import React, { useState } from 'react'
import { ScrollView, Text, TouchableOpacity } from 'react-native'

const QUEST_TABS = ["All", "Daily", "Weekly", "Monthly"]

export const QuestLists = () => {
  const [activeTab, setActiveTab] = useState("All")

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="flex-row px-3 py-2"
    >
      {QUEST_TABS.map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => setActiveTab(tab)}
          activeOpacity={0.7}
          className={`px-4 py-1.5 mr-2 rounded-full border
            ${
              activeTab === tab
                ? "bg-craftopia-primary border-craftopia-primary"
                : "bg-craftopia-surface border-craftopia-light"
            }`}
        >
          <Text
            className={`text-sm ${
              activeTab === tab
                ? "text-white font-semibold"
                : "text-craftopia-textSecondary"
            }`}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

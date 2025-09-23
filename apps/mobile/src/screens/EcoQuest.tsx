import React from 'react'
import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Achievements } from '~/components/quest/Achievements'
import { QuestBanner } from '~/components/quest/QuestBanner'
import { QuestHeader } from '~/components/quest/QuestHeader'
import { QuestLists } from '~/components/quest/QuestLists'

export const EcoQuestScreen = () => {
  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-light">
      <QuestHeader />
      
      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <QuestBanner />
        <Achievements />
        <QuestLists />
        
        {/* Minimal bottom spacing */}
        <View className="h-2" />
      </ScrollView>
    </SafeAreaView>
  )
}

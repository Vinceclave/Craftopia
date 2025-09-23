// EcoQuestScreen.tsx
import React from 'react'
import { ScrollView } from 'react-native'
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
        className="p-4"   // increased from p-2 → p-4 for breathing room
        contentInsetAdjustmentBehavior="automatic"
      >
        <QuestBanner />
        <Achievements />
        <QuestLists />
      </ScrollView>
    </SafeAreaView>
  )
}

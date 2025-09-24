import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { ScrollView, View } from 'react-native'
import { EcoQuestStackParamList } from '~/navigations/types'
import { DetailHeader } from '~/components/quest/details/DetailHeader'
import { DetailBanner } from '~/components/quest/details/DetailBanner'
import { DetailRow } from '~/components/quest/details/DetailRow'
import { apiService } from '~/services/base.service'
import { API_ENDPOINTS } from '~/config/api'

interface Quest {
  id: number
  category: string
  title: string
  description: string
  points_reward: number
  participantCount: number
  created_at: string
  expire_at?: string
  material_type: string
}

export const QuestDetailsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<EcoQuestStackParamList>>()
  const route = useRoute<RouteProp<EcoQuestStackParamList, 'QuestDetails'>>()
  const { questId } = route.params

  const [quest, setQuest] = useState<Quest | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isJoined, setIsJoined] = useState(false)

  // Fetch quest details
  const fetchQuest = async (id: number) => {
    try {
      setIsLoading(true)
      const response = await apiService.request(API_ENDPOINTS.CHALLENGES.BY_ID(id))
      const data = response.data

      setQuest({
        id: data.challenge_id,
        category: data.category,
        title: data.title,
        description: data.description,
        points_reward: Number(data.points_reward),
        participantCount: Number(data.participantCount),
        created_at: data.created_at,
        expire_at: data.expire_at,
        material_type: data.material_type
      })

      // Optionally, check if user has already joined
      setIsJoined(data.isJoined ?? false)
    } catch (error) {
      console.error('Failed to fetch quest:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Join a quest
  const joinChallenge = async (id: number) => {
    try {
      setIsLoading(true)
      const response = await apiService.request(API_ENDPOINTS.USER_CHALLENGES.JOIN, {
        method: 'POST',
        data: { challenge_id: id } // FIXED: send object
      })
      console.log('Join response:', response.data)
      setIsJoined(true)
    } catch (error) {
      console.error('Join error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchQuest(questId)
  }, [questId])

  const handleBack = () => navigation.goBack()
  const handleJoinPress = () => {
    if (quest && !isJoined) {
      joinChallenge(quest.id)
    }
  }

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-light">
      <DetailHeader onBackPress={handleBack} questId={questId} />

      <DetailBanner
        category={quest?.category || ''}
        title={quest?.title || ''}
        description={quest?.description || ''}
        points={quest?.points_reward || 0}
        isLoading={isLoading}
        isJoined={isJoined}
        onPress={handleJoinPress}
      />

      <ScrollView 
        className="flex-1" 
        contentContainerClassName='pb-100'
        showsVerticalScrollIndicator={false}
      >
        {quest && (
          <DetailRow
            category={quest.category}
            materialType={quest.material_type}
            created_at={quest.created_at}
            expire_at={quest.expire_at}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

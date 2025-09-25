import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { ScrollView, View, Alert } from 'react-native'
import { EcoQuestStackParamList } from '~/navigations/types'
import { DetailHeader } from '~/components/quest/details/DetailHeader'
import { DetailBanner } from '~/components/quest/details/DetailBanner'
import { apiService } from '~/services/base.service'
import { API_ENDPOINTS } from '~/config/api'
import { UserQuestProgress } from '~/components/quest/details/UserQuestProgress'

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
  participants: number
  isJoined?: boolean
}

export const QuestDetailsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<EcoQuestStackParamList>>()
  const route = useRoute<RouteProp<EcoQuestStackParamList, 'QuestDetails'>>()
  const { questId } = route.params

  const [quest, setQuest] = useState<Quest | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isJoined, setIsJoined] = useState(false)

  const fetchQuest = async (id: number) => {
    try {
      setIsLoading(true)
      const response: any = await apiService.request(API_ENDPOINTS.CHALLENGES.BY_ID(id))
      const data = response.data
      console.log(data)

      const questData: Quest = {
        id: data.challenge_id,
        category: data.category,
        title: data.title,
        description: data.description,
        points_reward: Number(data.points_reward),
        participantCount: Number(data.participantCount),
        created_at: data.created_at,
        expire_at: data.expire_at,
        material_type: data.material_type,
        participants: data.participantCount,
        isJoined: data.isJoined ?? false,
      }

      setQuest(questData)
      setIsJoined(questData.isJoined ?? false)
    } catch (error) {
      console.error('Failed to fetch quest:', error)
      Alert.alert('Error', 'Failed to load quest details')
    } finally {
      setIsLoading(false)
    }
  }

  const joinChallenge = async (id: number) => {
    try {
      setIsLoading(true)
      const response = await apiService.request(API_ENDPOINTS.USER_CHALLENGES.JOIN, {
        method: 'POST',
        data: { challenge_id: id },
      })

      setIsJoined(true)
      if (quest) {
        setQuest({ ...quest, isJoined: true })
      }

      Alert.alert('Success!', 'You have successfully joined this challenge!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to join challenge'

      if (errorMessage.includes('already joined')) {
        setIsJoined(true)
        if (quest) {
          setQuest({ ...quest, isJoined: true })
        }
        Alert.alert('Info', 'You have already joined this challenge!')
      } else {
        Alert.alert('Error', errorMessage)
      }
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
  console.log(quest)
  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-light">
      <DetailHeader onBackPress={handleBack} questId={questId} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <DetailBanner
          category={quest?.category || ''}
          title={quest?.title || ''}
          description={quest?.description || ''}
          points={quest?.points_reward || 0}
          participants={Number(quest?.participantCount)}
          isLoading={isLoading}
          isJoined={isJoined}
          onPress={handleJoinPress}
        />
        {isJoined && (
          <UserQuestProgress
            id={quest?.id}
            description={quest?.description}
            points={quest?.points_reward}
          />
        )}

        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  )
}
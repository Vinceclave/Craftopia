// apps/mobile/src/screens/quest/QuestDetails.tsx
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { ScrollView, View, Text } from 'react-native'
import { EcoQuestStackParamList } from '~/navigations/types'
import { DetailHeader } from '~/components/quest/details/DetailHeader'
import { DetailBanner } from '~/components/quest/details/DetailBanner'
import { UserQuestProgress } from '~/components/quest/details/UserQuestProgress'
import { useChallenge } from '~/hooks/queries/useChallenges'
import { useJoinChallenge, useUserChallengeProgress } from '~/hooks/queries/useUserChallenges'
import { useAlert } from '~/hooks/useAlert'

export const QuestDetailsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<EcoQuestStackParamList>>()
  const route = useRoute<RouteProp<EcoQuestStackParamList, 'QuestDetails'>>()
  const { questId } = route.params
  const { success, error } = useAlert()

  // Get challenge details
  const { 
    data: quest, 
    isLoading: questLoading, 
    error: questError 
  } = useChallenge(questId)

  // Get user's progress for this challenge
  const { 
    data: userProgress, 
    isLoading: progressLoading,
    error: progressError 
  } = useUserChallengeProgress(questId)

  // Join challenge mutation
  const joinChallengeMutation = useJoinChallenge()

  const handleBack = () => navigation.goBack()

  const handleJoinPress = async () => {
    if (!quest || userProgress) return

    try {
      await joinChallengeMutation.mutateAsync(quest.challenge_id)
      success('Success!', 'You have successfully joined this challenge!')
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to join challenge'
      
      if (errorMessage.includes('already joined')) {
        success('Info', 'You have already joined this challenge!')
      } else {
        error('Error', errorMessage)
      }
    }
  }

  // Loading state
  const isLoading = questLoading || (progressLoading && !progressError?.message?.includes('not found'))

  // Determine if user has joined (404 error means they haven't joined)
  const isJoined = !!userProgress

  // Handle quest error
  if (questError) {
    return (
      <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-light">
        <DetailHeader onBackPress={handleBack} questId={questId} />
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-lg font-semibold text-craftopia-textPrimary mb-2">
            Failed to load quest
          </Text>
          <Text className="text-sm text-craftopia-textSecondary text-center">
            {questError.message || 'Something went wrong'}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-light">
      <DetailHeader onBackPress={handleBack} questId={questId} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <DetailBanner
          category={quest?.category || ''}
          title={quest?.title || ''}
          description={quest?.description || ''}
          points={quest?.points_reward || 0}
          wasteKg={quest?.waste_kg || 0} // NEW
          participants={quest?.participantCount || 0}
          isLoading={isLoading}
          isJoined={isJoined}
          onPress={handleJoinPress}
        />

        {/* Show progress component only if user has joined */}
        {isJoined && quest && (
          <UserQuestProgress
            id={quest.challenge_id}
            description={quest.description}
            points={quest.points_reward}
            wasteKg={quest.waste_kg} // NEW
          />
        )}

        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  )
}
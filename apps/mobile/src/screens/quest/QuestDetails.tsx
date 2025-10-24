// apps/mobile/src/screens/quest/QuestDetails.tsx - FIXED VERSION
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'
import { SkipForward } from 'lucide-react-native'
import { EcoQuestStackParamList } from '~/navigations/types'
import { DetailHeader } from '~/components/quest/details/DetailHeader'
import { DetailBanner } from '~/components/quest/details/DetailBanner'
import { UserQuestProgress } from '~/components/quest/details/UserQuestProgress'
import { SkipChallengeModal } from '~/components/quest/details/SkipChallengeModal'
import { useChallenge } from '~/hooks/queries/useChallenges'
import { useJoinChallenge, useUserChallengeProgress, useSkipChallenge } from '~/hooks/queries/useUserChallenges'
import { useAlert } from '~/hooks/useAlert'

export const QuestDetailsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<EcoQuestStackParamList>>()
  const route = useRoute<RouteProp<EcoQuestStackParamList, 'QuestDetails'>>()
  const { questId } = route.params
  const { success, error } = useAlert()
  const [skipModalVisible, setSkipModalVisible] = useState(false)

  // ✅ FIX: Log the received questId immediately
  useEffect(() => {
    console.log('📍 QuestDetailsScreen mounted with questId:', questId);
  }, [questId]);

  // Get challenge details
  const { 
    data: quest, 
    isLoading: questLoading, 
    error: questError 
  } = useChallenge(questId)

  // ✅ FIX: Log when quest data is loaded
  useEffect(() => {
    if (quest) {
      console.log('✅ Quest data loaded:', {
        challenge_id: quest.challenge_id,
        title: quest.title,
        points_reward: quest.points_reward,
        waste_kg: quest.waste_kg
      });
    }
  }, [quest]);

  // Get user's progress for this challenge
  const { 
    data: userProgress, 
    isLoading: progressLoading,
    error: progressError 
  } = useUserChallengeProgress(questId)

  // ✅ FIX: Log user progress
  useEffect(() => {
    if (userProgress) {
      console.log('✅ User progress loaded:', {
        user_challenge_id: userProgress.user_challenge_id,
        challenge_id: userProgress.challenge_id,
        status: userProgress.status
      });
    } else if (progressError && !progressError.message?.includes('not found')) {
      console.log('⚠️ Progress error:', progressError.message);
    }
  }, [userProgress, progressError]);

  // Mutations
  const joinChallengeMutation = useJoinChallenge()
  const skipChallengeMutation = useSkipChallenge()

  const handleBack = () => navigation.goBack()

  const handleJoinPress = async () => {
    if (!quest || userProgress) {
      console.log('⚠️ Cannot join:', { hasQuest: !!quest, hasProgress: !!userProgress });
      return;
    }

    // ✅ FIX: Verify we're joining the correct challenge
    console.log('🎯 Attempting to join challenge:', {
      challenge_id: quest.challenge_id,
      title: quest.title,
      questId: questId
    });

    // ✅ FIX: Double-check IDs match
    if (quest.challenge_id !== questId) {
      console.error('❌ MISMATCH: quest.challenge_id !== questId', {
        quest_challenge_id: quest.challenge_id,
        questId: questId
      });
      error('Error', 'Challenge ID mismatch. Please try again.');
      return;
    }

    try {
      await joinChallengeMutation.mutateAsync(quest.challenge_id)
      success('Success!', `You have successfully joined "${quest.title}"!`)
      
      console.log('✅ Successfully joined challenge:', quest.challenge_id);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to join challenge'
      
      console.error('❌ Join error:', errorMessage);
      
      if (errorMessage.includes('already joined')) {
        success('Info', 'You have already joined this challenge!')
      } else {
        error('Error', errorMessage)
      }
    }
  }

  // Handle skip challenge
  const handleSkipChallenge = async (reason?: string) => {
    if (!userProgress?.user_challenge_id) {
      error('Error', 'Challenge data not found')
      return
    }

    console.log('🔄 Skipping challenge:', {
      user_challenge_id: userProgress.user_challenge_id,
      challenge_id: userProgress.challenge_id,
      reason
    });

    try {
      await skipChallengeMutation.mutateAsync({
        userChallengeId: userProgress.user_challenge_id,
        reason,
      })
      
      setSkipModalVisible(false)
      success('Challenge Skipped', 'No worries! Try another challenge that fits your schedule.')
      
      console.log('✅ Challenge skipped successfully');
      
      // Navigate back to challenges list
      setTimeout(() => {
        navigation.goBack()
      }, 1000)
    } catch (err: any) {
      console.error('❌ Skip error:', err);
      error('Error', err.message || 'Failed to skip challenge')
    }
  }

  // Loading state
  const isLoading = questLoading || (progressLoading && !progressError?.message?.includes('not found'))

  // Determine if user has joined
  const isJoined = !!userProgress

  // Can skip: user has joined and status is in_progress
  const canSkip = isJoined && userProgress?.status === 'in_progress'

  // Handle quest error
  if (questError) {
    console.error('❌ Quest error:', questError);
    
    return (
      <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-light">
        <DetailHeader onBackPress={handleBack} questId={questId} />
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-lg font-semibold text-craftopia-textPrimary mb-2">
            Failed to load quest
          </Text>
          <Text className="text-sm text-craftopia-textSecondary text-center mb-2">
            {questError.message || 'Something went wrong'}
          </Text>
          <Text className="text-xs text-craftopia-textSecondary text-center">
            Quest ID: {questId}
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
          wasteKg={quest?.waste_kg || 0}
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
            wasteKg={quest.waste_kg}
          />
        )}

        {/* Skip Challenge Button */}
        {canSkip && (
          <View className="mx-4 my-3">
            <TouchableOpacity
              onPress={() => setSkipModalVisible(true)}
              className="flex-row items-center justify-center p-3 bg-craftopia-light rounded-lg border border-craftopia-light"
              activeOpacity={0.7}
            >
              <SkipForward size={16} color="#6b7280" />
              <Text className="text-sm text-craftopia-textSecondary ml-2 font-medium">
                Skip this challenge
              </Text>
            </TouchableOpacity>
            <Text className="text-xs text-craftopia-textSecondary text-center mt-2">
              No penalty - try another challenge anytime!
            </Text>
          </View>
        )}

        <View className="h-4" />
      </ScrollView>

      {/* Skip Challenge Modal */}
      <SkipChallengeModal
        visible={skipModalVisible}
        onClose={() => setSkipModalVisible(false)}
        onConfirm={handleSkipChallenge}
        loading={skipChallengeMutation.isPending}
      />
    </SafeAreaView>
  )
}
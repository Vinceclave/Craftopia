// apps/mobile/src/components/quest/details/UserQuestProgress.tsx
import React, { useState } from 'react'
import { Text, View, ActivityIndicator } from 'react-native'
import { CheckCircle, Clock, Upload, Leaf } from 'lucide-react-native'
import Button from '~/components/common/Button'
import { ImageUploadPicker } from '~/components/common/ImageUploadPicker'
import { useUserChallengeProgress, useSubmitChallengeVerification } from '~/hooks/queries/useUserChallenges'
import { useAlert } from '~/hooks/useAlert'

interface UserQuestProgressProps {
  id: number
  description?: string
  points?: number
  wasteKg?: number // NEW: potential waste to save
}

export const UserQuestProgress: React.FC<UserQuestProgressProps> = ({
  id,
  description,
  points,
  wasteKg = 0, // NEW
}) => {
  const { success, error } = useAlert()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Get user's progress for this challenge
  const { 
    data: challengeData, 
    isLoading: loading,
    error: progressError,
    refetch 
  } = useUserChallengeProgress(id)

  // Submit verification mutation
  const submitVerificationMutation = useSubmitChallengeVerification()

  // Set initial image URL when data loads
  React.useEffect(() => {
    if (challengeData?.proof_url && !imageUrl) {
      setImageUrl(challengeData.proof_url)
    }
  }, [challengeData?.proof_url, imageUrl])

  const handleVerify = async () => {
    if (!imageUrl || imageUrl.startsWith('file://')) {
      error('Error', 'Please upload a proof image first')
      return
    }
    
    if (!challengeData?.user_challenge_id) {
      error('Error', 'Challenge data not found. Please try refreshing.')
      return
    }

    try {
      await submitVerificationMutation.mutateAsync({
        userChallengeId: challengeData.user_challenge_id,
        proofUrl: imageUrl,
        description,
        points,
        challengeId: id,
      })
      
      success('Success', 'Challenge submitted for verification!')
      // Refetch to get updated status
      refetch()
    } catch (err: any) {
      const msg = err.message || 'Something went wrong.'
      error('Error', msg)
    }
  }

  const getStatusIcon = () => {
    if (!challengeData) return null
    return challengeData.status === 'completed'
      ? <CheckCircle size={14} color="#004E98" />
      : <Clock size={14} color="#FF6700" />
  }

  const getStatusColor = () => {
    if (!challengeData) return 'text-craftopia-textSecondary'
    switch (challengeData.status) {
      case 'completed': return 'text-craftopia-primary'
      case 'rejected': return 'text-red-600'
      default: return 'text-craftopia-accent'
    }
  }

  const getButtonTitle = () => {
    if (submitVerificationMutation.isPending || isUploading) return 'Processing...'
    if (!challengeData) return 'Submit for Verification'
    switch (challengeData.status) {
      case 'pending_verification': return 'Waiting for Verification'
      case 'completed': return 'Completed'
      case 'rejected': return 'Challenge Rejected'
      default: return 'Submit for Verification'
    }
  }

  const isDisabled = () =>
    !challengeData ? false : 
    submitVerificationMutation.isPending || 
    isUploading || 
    !imageUrl || 
    ['pending_verification', 'completed'].includes(challengeData.status)

  // Show error state (but not for 404 - that means user hasn't joined)
  if (progressError && !progressError.message?.includes('not found')) {
    return (
      <View className="mx-4 my-3 p-3 bg-craftopia-surface rounded-lg border border-craftopia-light">
        <Text className="text-sm font-semibold text-craftopia-textPrimary mb-3">Your Progress</Text>
        <View className="items-center py-4">
          <Text className="text-sm text-red-500 text-center">
            Failed to load progress: {progressError.message}
          </Text>
          <Button
            title="Retry"
            onPress={() => refetch()}
            size="md"
            className="mt-2"
          />
        </View>
      </View>
    )
  }

  // If user hasn't joined the challenge yet, don't show the progress component
  if (!challengeData && !loading) {
    return null;
  }

  return (
    <View className="mx-4 my-3 p-3 bg-craftopia-surface rounded-lg border border-craftopia-light">
      <Text className="text-sm font-semibold text-craftopia-textPrimary mb-3">Your Progress</Text>

      {loading ? (
        <View className="items-center py-2">
          <ActivityIndicator size="small" color="#004E98" />
          <Text className="text-xs text-craftopia-textSecondary mt-1">Loading progress...</Text>
        </View>
      ) : (
        <>
          <ImageUploadPicker
            label="Proof Image"
            description="Upload from camera or gallery"
            value={imageUrl || undefined}
            onChange={setImageUrl}
            folder="challenges"
            onUploadStart={() => setIsUploading(true)}
            onUploadComplete={() => setIsUploading(false)}
            disabled={['pending_verification', 'completed'].includes(challengeData?.status || '')}
          />

          <Button
            title={getButtonTitle()}
            onPress={handleVerify}
            disabled={isDisabled()}
            leftIcon={submitVerificationMutation.isPending || isUploading ? undefined : <Upload size={14} color="#fff" />}
            loading={submitVerificationMutation.isPending}
            size="md"
            className="mt-2"
          />

          {challengeData && (
            <View className="flex flex-row mt-3 pt-2 border-t border-craftopia-light items-center justify-between">
              <View className="flex-row items-center">
                {getStatusIcon()}
                <Text className={`text-xs font-medium ml-1 ${getStatusColor()}`}>
                  {challengeData.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>

              {/* NEW: Show waste saved if completed */}
              {challengeData.status === 'completed' && challengeData.waste_kg_saved > 0 && (
                <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full">
                  <Leaf size={12} color="#16a34a" />
                  <Text className="text-xs text-green-600 ml-1 font-medium">
                    {challengeData.waste_kg_saved.toFixed(2)} kg saved
                  </Text>
                </View>
              )}

              {challengeData.verified_at && (
                <View className="flex-row items-center">
                  <CheckCircle size={12} color="#00A896" />
                  <Text className="text-xs text-green-600 ml-1">
                    {new Date(challengeData.verified_at).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          )}
        </>
      )}
    </View>
  )
} 
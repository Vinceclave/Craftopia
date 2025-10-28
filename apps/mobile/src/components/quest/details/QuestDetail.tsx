import { Award, Users, Leaf, CheckCircle, Clock, Upload, AlertCircle, PlayCircle, Target } from 'lucide-react-native'
import React, { useState } from 'react'
import { Text, View, ActivityIndicator } from 'react-native'
import Button from '~/components/common/Button'
import { ImageUploadPicker } from '~/components/common/ImageUploadPicker'
import { useUserChallengeProgress, useSubmitChallengeVerification } from '~/hooks/queries/useUserChallenges'
import { useAlert } from '~/hooks/useAlert'

interface QuestDetailProps {
  participants: number
  category: string
  title: string
  description: string
  points: number
  wasteKg?: number
  isLoading?: boolean
  isJoined: boolean
  onJoinPress: () => void
  questId: number
  progressDescription?: string
}

// Safe hook wrapper to prevent navigation errors
const useSafeUserChallengeProgress = (questId: number) => {
  try {
    return useUserChallengeProgress(questId)
  } catch (error) {
    console.warn('Navigation context not available for useUserChallengeProgress')
    return { 
      data: null, 
      isLoading: false, 
      error: new Error('Navigation not available'),
      refetch: () => {}
    }
  }
}

const useSafeAlert = () => {
  try {
    return useAlert()
  } catch (error) {
    console.warn('Navigation context not available for useAlert')
    return {
      success: (title: string, message: string) => console.log('Success:', title, message),
      error: (title: string, message: string) => console.log('Error:', title, message)
    }
  }
}

export const QuestDetail: React.FC<QuestDetailProps> = ({ 
  participants,
  category, 
  title, 
  description, 
  points,
  wasteKg = 0,
  isLoading = false,
  isJoined,
  onJoinPress,
  questId,
  progressDescription,
}) => {
  const { success, error } = useSafeAlert()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { 
    data: challengeData, 
    isLoading: progressLoading,
    error: progressError,
    refetch 
  } = useSafeUserChallengeProgress(questId)

  const submitVerificationMutation = useSubmitChallengeVerification()

  React.useEffect(() => {
    if (challengeData?.proof_url && !imageUrl) {
      setImageUrl(challengeData.proof_url)
    }
  }, [challengeData?.proof_url, imageUrl])

  const handleVerify = async () => {
    if (!imageUrl) {
      error('Error', 'Please upload a proof image first')
      return
    }
    if (isUploading || imageUrl.startsWith('file://')) {
      error('Error', 'Please wait for image upload to complete')
      return
    }
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('/uploads/')) {
      error('Error', 'Invalid image URL. Please re-upload the image.')
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
        description: progressDescription || '',
        points: points || 0,
        challengeId: questId,
      })
      success('Success', 'Challenge submitted for verification!')
      refetch()
    } catch (err: any) {
      console.error('❌ Verification error:', err)
      if (err.message?.includes('valid uri') || err.message?.includes('URI')) {
        error('Error', 'Invalid image URL. Please re-upload your proof image.')
        setImageUrl(null)
      } else {
        error('Error', err.message || 'Something went wrong.')
      }
    }
  }

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case 'completed':
        return { 
          icon: <CheckCircle size={14} color="#4A7C59" />,
          bgColor: 'bg-craftopia-success/10',
          borderColor: 'border-craftopia-success/30',
          textColor: 'text-craftopia-success',
          label: 'COMPLETED'
        }
      case 'pending_verification':
        return { 
          icon: <Clock size={14} color="#D4A96A" />,
          bgColor: 'bg-craftopia-accent/10',
          borderColor: 'border-craftopia-accent/30',
          textColor: 'text-craftopia-accent',
          label: 'PENDING'
        }
      case 'rejected':
        return { 
          icon: <AlertCircle size={14} color="#8B4513" />,
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-600',
          label: 'REJECTED'
        }
      case 'in_progress':
        return { 
          icon: <PlayCircle size={14} color="#374A36" />,
          bgColor: 'bg-craftopia-primary/10',
          borderColor: 'border-craftopia-primary/30',
          textColor: 'text-craftopia-primary',
          label: 'IN PROGRESS'
        }
      default:
        return { 
          icon: <Clock size={14} color="#5D6B5D" />,
          bgColor: 'bg-craftopia-light',
          borderColor: 'border-craftopia-light',
          textColor: 'text-craftopia-textSecondary',
          label: 'NOT STARTED'
        }
    }
  }

  const getProgressButtonTitle = () => {
    if (submitVerificationMutation.isPending) return 'Verifying...'
    if (isUploading) return 'Uploading Image...'
    if (!challengeData) return 'Submit for Verification'
    switch (challengeData.status) {
      case 'pending_verification': return 'Waiting for Verification'
      case 'completed': return 'Completed ✓'
      case 'rejected': return 'Resubmit Proof'
      default: return 'Submit for Verification'
    }
  }

  const isProgressDisabled = () => {
    if (!challengeData) {
      return isUploading || !imageUrl || imageUrl.startsWith('file://')
    }
    return (
      submitVerificationMutation.isPending || 
      isUploading || 
      !imageUrl ||
      imageUrl.startsWith('file://') || 
      ['pending_verification', 'completed'].includes(challengeData.status)
    )
  }

  const statusConfig = getStatusConfig(challengeData?.status)

  // Loading state
  if (isLoading) {
    return (
      <View className="mx-4 mt-4">
        <View className="bg-craftopia-surface rounded-xl px-5 py-4 border border-craftopia-light/50">
          <View className="flex-row items-center justify-between mb-3">
            <View className="w-20 h-5 bg-craftopia-light rounded-full" />
            <View className="w-16 h-5 bg-craftopia-light rounded-full" />
          </View>
          <View className="w-4/5 h-6 bg-craftopia-light rounded mb-2" />
          <View className="w-full h-4 bg-craftopia-light rounded mb-1" />
          <View className="w-3/4 h-4 bg-craftopia-light rounded mb-4" />
          <View className="flex-row gap-2 mb-4">
            <View className="w-24 h-10 bg-craftopia-light rounded-xl" />
            <View className="w-20 h-10 bg-craftopia-light rounded-xl" />
          </View>
          <View className="w-full h-12 bg-craftopia-light rounded-full" />
        </View>
      </View>
    )
  }

  return (
    <View className="mx-4 mt-4">
      {/* Main Quest Card - Home style with clean layout */}
      <View className="bg-craftopia-surface rounded-xl px-5 py-4 border border-craftopia-light/50 mb-3">
        {/* Header Row - Category & Status */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center px-3 py-1.5 rounded-full bg-craftopia-accent/10 border border-craftopia-accent/20">
            <Target size={14} color="#D4A96A" />
            <Text className="text-xs font-semibold text-craftopia-accent uppercase tracking-wide ml-1">
              {category}
            </Text>
          </View>
          
          {isJoined && challengeData && (
            <View className={`flex-row items-center px-2.5 py-1 rounded-full border ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
              {statusConfig.icon}
              <Text className={`text-xs font-semibold uppercase tracking-wide ml-1 ${statusConfig.textColor}`}>
                {statusConfig.label}
              </Text>
            </View>
          )}
        </View>

        {/* Title & Description */}
        <Text className="text-xl font-bold text-craftopia-textPrimary mb-2">
          {title}
        </Text>
        <Text className="text-sm text-craftopia-textSecondary leading-5 mb-4">
          {description}
        </Text>

        {/* Stats Row - Similar to HomeStats compact layout */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center gap-2">
            {/* Points */}
            <View className="flex-row items-center bg-craftopia-primary/10 px-3 py-2 rounded-xl">
              <Award size={16} color="#374A36" />
              <Text className="text-base font-bold text-craftopia-primary ml-1.5">
                {points}
              </Text>
              <Text className="text-xs text-craftopia-textSecondary ml-0.5">pts</Text>
            </View>

            {/* Waste Impact */}
            {wasteKg > 0 && (
              <View className="flex-row items-center bg-craftopia-success/10 px-3 py-2 rounded-xl">
                <Leaf size={16} color="#4A7C59" />
                <Text className="text-base font-bold text-craftopia-success ml-1.5">
                  {wasteKg.toFixed(1)}
                </Text>
                <Text className="text-xs text-craftopia-textSecondary ml-0.5">kg</Text>
              </View>
            )}
          </View>
          
          {/* Participants */}
          <View className="flex-row items-center bg-craftopia-light px-3 py-2 rounded-xl">
            <Users size={16} color="#5D6B5D" />
            <Text className="text-sm font-bold text-craftopia-textSecondary ml-1.5">
              {participants}
            </Text>
          </View>
        </View>

        {/* Action Button */}
        {!isJoined ? (
          <Button
            onPress={onJoinPress}
            title="Join Challenge"
            size="md"
            loading={isLoading}
            className="rounded-full"
          />
        ) : (
          <View className={`py-3 rounded-full items-center ${
            challengeData?.status === 'completed' 
              ? 'bg-craftopia-success/10 border border-craftopia-success/30' 
              : 'bg-craftopia-light'
          }`}>
            <Text className={`text-sm font-semibold ${
              challengeData?.status === 'completed' 
                ? 'text-craftopia-success' 
                : 'text-craftopia-textSecondary'
            }`}>
              {challengeData?.status === 'completed' ? '✅ Quest Completed!' : '✓ Quest Joined'}
            </Text>
          </View>
        )}
      </View>

      {/* Progress Section - Only show if joined but not completed */}
      {isJoined && challengeData?.status !== 'completed' && (
        <View className="bg-craftopia-surface rounded-xl px-4 py-4 border border-craftopia-light/50 mb-3">
          {/* Section Header - Home style */}
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-full bg-craftopia-primary/10 items-center justify-center mr-2">
              <Clock size={16} color="#374A36" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-craftopia-textPrimary">
                Your Progress
              </Text>
              <Text className="text-xs text-craftopia-textSecondary">
                Upload proof to complete
              </Text>
            </View>
          </View>

          {progressLoading ? (
            <View className="items-center py-4">
              <ActivityIndicator size="small" color="#374A36" />
              <Text className="text-xs text-craftopia-textSecondary mt-2">Loading progress...</Text>
            </View>
          ) : progressError ? (
            <View className="items-center py-4 bg-craftopia-light rounded-lg">
              <AlertCircle size={24} color="#8B4513" />
              <Text className="text-sm text-craftopia-textSecondary text-center mt-2 font-medium">
                {progressError.message?.includes('not found') ? 'Not yet started' : 'Failed to load progress'}
              </Text>
            </View>
          ) : (
            <>
              {/* Image Upload */}
              <View className="mb-3">
                <Text className="text-sm font-semibold text-craftopia-textPrimary mb-1">
                  Proof of Completion
                </Text>
                <Text className="text-xs text-craftopia-textSecondary mb-2">
                  Upload a photo showing your completion
                </Text>
                <ImageUploadPicker
                  label=""
                  description="Tap to upload image"
                  value={imageUrl || undefined}
                  onChange={(url) => setImageUrl(url || null)}
                  folder="challenges"
                  onUploadStart={() => setIsUploading(true)}
                  onUploadComplete={() => setIsUploading(false)}
                  disabled={challengeData?.status === 'pending_verification'}
                />
              </View>

              {/* Upload Status Messages */}
              {isUploading && (
                <View className="flex-row items-center bg-craftopia-accent/10 px-3 py-2 rounded-lg mb-2">
                  <ActivityIndicator size="small" color="#D4A96A" />
                  <Text className="text-xs text-craftopia-accent ml-2 font-medium">
                    Uploading your image...
                  </Text>
                </View>
              )}

              {imageUrl && !imageUrl.startsWith('file://') && !isUploading && (
                <View className="flex-row items-center bg-craftopia-success/10 px-3 py-2 rounded-lg mb-2">
                  <CheckCircle size={16} color="#4A7C59" />
                  <Text className="text-xs text-craftopia-success ml-2 font-medium">
                    Image ready for submission
                  </Text>
                </View>
              )}

              {/* Submit Button */}
              <Button
                title={getProgressButtonTitle()}
                onPress={handleVerify}
                disabled={isProgressDisabled()}
                leftIcon={submitVerificationMutation.isPending || isUploading ? undefined : <Upload size={16} color="#fff" />}
                loading={submitVerificationMutation.isPending}
                size="md"
                className="rounded-full"
              />

              {/* Rejection Message */}
              {challengeData?.status === 'rejected' && (
                <View className="mt-3 px-3 py-2.5 bg-red-500/5 rounded-lg border border-red-500/20">
                  <View className="flex-row items-center mb-1">
                    <AlertCircle size={14} color="#DC2626" />
                    <Text className="text-xs text-red-600 font-semibold ml-1.5">
                      Verification Required
                    </Text>
                  </View>
                  <Text className="text-xs text-craftopia-textSecondary">
                    Your previous submission was rejected. Please upload a clearer image.
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      )}

      {/* Completed Stats Card - Home style success card */}
      {isJoined && challengeData?.status === 'completed' && (
        <View className="bg-craftopia-success/10 rounded-xl px-4 py-4 border border-craftopia-success/30 mb-3">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-craftopia-success/20 items-center justify-center mr-2">
                <CheckCircle size={16} color="#4A7C59" />
              </View>
              <Text className="text-base font-bold text-craftopia-success">
                Challenge Completed!
              </Text>
            </View>
            <View className="bg-craftopia-success/20 px-3 py-1 rounded-full">
              <Text className="text-craftopia-success text-xs font-bold">
                +{points} pts
              </Text>
            </View>
          </View>
          
          {challengeData.waste_kg_saved > 0 && (
            <View className="flex-row items-center bg-white px-3 py-2 rounded-lg mb-2">
              <Leaf size={16} color="#4A7C59" />
              <Text className="text-craftopia-success text-sm font-semibold ml-1.5">
                {challengeData.waste_kg_saved.toFixed(2)} kg waste saved
              </Text>
            </View>
          )}

          {challengeData.verified_at && (
            <Text className="text-xs text-craftopia-textSecondary">
              Verified on {new Date(challengeData.verified_at).toLocaleDateString()}
            </Text>
          )}
        </View>
      )}

      {/* Tips Card - Home style encouragement */}
      <View className="bg-craftopia-light rounded-xl px-3 py-2.5 mb-3">
        <Text className="text-xs font-medium text-craftopia-textPrimary text-center">
          💡 Complete challenges to earn points and make an impact!
        </Text>
      </View>
    </View>
  )
}
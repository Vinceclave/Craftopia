import { Award, Users, Leaf, CheckCircle, Clock, Upload, AlertCircle, PlayCircle } from 'lucide-react-native'
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
          color: 'bg-craftopia-success/20 border-craftopia-success/30 text-craftopia-success',
          label: 'COMPLETED'
        }
      case 'pending_verification':
        return { 
          icon: <Clock size={14} color="#D4A96A" />,
          color: 'bg-craftopia-accent/20 border-craftopia-accent/30 text-craftopia-accent',
          label: 'PENDING'
        }
      case 'rejected':
        return { 
          icon: <AlertCircle size={14} color="#8B4513" />,
          color: 'bg-craftopia-error/20 border-craftopia-error/30 text-craftopia-error',
          label: 'REJECTED'
        }
      case 'in_progress':
        return { 
          icon: <PlayCircle size={14} color="#5D8AA8" />,
          color: 'bg-craftopia-info/20 border-craftopia-info/30 text-craftopia-info',
          label: 'IN PROGRESS'
        }
      default:
        return { 
          icon: <Clock size={14} color="#5D6B5D" />,
          color: 'bg-craftopia-light border-craftopia-light text-craftopia-textSecondary',
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
      <View className="mx-4 mt-4 p-5 bg-craftopia-surface rounded-2xl border border-craftopia-light">
        <View className="h-4 bg-craftopia-light rounded-full mb-3 w-20" />
        <View className="h-6 bg-craftopia-light rounded-lg mb-2 w-4/5" />
        <View className="h-3 bg-craftopia-light rounded mb-2 w-full" />
        <View className="h-3 bg-craftopia-light rounded mb-3 w-3/4" />
        <View className="flex-row gap-2 mb-3">
          <View className="h-7 bg-craftopia-light rounded-full w-24" />
          <View className="h-7 bg-craftopia-light rounded-full w-16" />
        </View>
        <View className="h-10 bg-craftopia-light rounded-lg" />
      </View>
    )
  }

  return (
    <View className="mx-4 mt-4">
      {/* Main Quest Card */}
      <View className="bg-craftopia-surface rounded-2xl border border-craftopia-light p-5">
        {/* Header with Category and Status */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="bg-craftopia-primary/10 px-3 py-1.5 rounded-full">
            <Text className="text-craftopia-primary text-xs font-semibold">{category}</Text>
          </View>
          {isJoined && challengeData && (
            <View className={`flex-row items-center px-2.5 py-1 rounded-full border ${statusConfig.color}`}>
              {statusConfig.icon}
              <Text className={`text-xs font-semibold ml-1.5 ${statusConfig.color.split(' ')[2]}`}>
                {statusConfig.label}
              </Text>
            </View>
          )}
        </View>

        {/* Title & Description */}
        <Text className="text-xl font-bold text-craftopia-textPrimary mb-2 leading-7">
          {title}
        </Text>
        <Text className="text-sm text-craftopia-textSecondary leading-5 mb-4">
          {description}
        </Text>

        {/* Stats Grid */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center bg-craftopia-primary/5 px-3 py-2 rounded-xl">
              <Award size={16} color="#374A36" />
              <Text className="text-craftopia-primary text-sm font-bold ml-1.5">
                {points}
              </Text>
              <Text className="text-craftopia-textSecondary text-xs ml-0.5">pts</Text>
            </View>

            {wasteKg > 0 && (
              <View className="flex-row items-center bg-craftopia-success/10 px-3 py-2 rounded-xl">
                <Leaf size={16} color="#4A7C59" />
                <Text className="text-craftopia-success text-sm font-bold ml-1.5">
                  {wasteKg.toFixed(1)}
                </Text>
                <Text className="text-craftopia-textSecondary text-xs ml-0.5">kg</Text>
              </View>
            )}
          </View>
          
          <View className="flex-row items-center bg-craftopia-light px-3 py-2 rounded-xl">
            <Users size={16} color="#5D6B5D" />
            <Text className="text-craftopia-textSecondary text-sm font-bold ml-1.5">
              {participants}
            </Text>
          </View>
        </View>

        {/* Main Action Button */}
        {!isJoined ? (
          <Button
            onPress={onJoinPress}
            title="Start Quest"
            size="md"
            loading={isLoading}
            className="rounded-lg"
          />
        ) : (
          <View className={`p-3 rounded-lg ${challengeData?.status === 'completed' ? 'bg-craftopia-success/10' : 'bg-craftopia-light'}`}>
            <Text className={`text-center font-semibold text-sm ${challengeData?.status === 'completed' ? 'text-craftopia-success' : 'text-craftopia-textSecondary'}`}>
              {challengeData?.status === 'completed' ? '🎉 Quest Completed!' : '✅ Quest Joined'}
            </Text>
          </View>
        )}
      </View>

      {/* Progress Section - Only show if user has joined but not completed */}
      {isJoined && challengeData?.status !== 'completed' && (
        <View className="bg-craftopia-surface rounded-2xl border border-craftopia-light p-5 mt-3">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-lg font-bold text-craftopia-textPrimary">Your Progress</Text>
              <Text className="text-xs text-craftopia-textSecondary mt-1">
                Upload proof to complete the challenge
              </Text>
            </View>
          </View>

          {progressLoading ? (
            <View className="items-center py-3">
              <ActivityIndicator size="small" color="#374A36" />
              <Text className="text-xs text-craftopia-textSecondary mt-1">Loading progress...</Text>
            </View>
          ) : progressError ? (
            <View className="items-center py-3">
              <AlertCircle size={24} color="#8B4513" />
              <Text className="text-sm text-craftopia-error text-center mt-2 font-semibold">
                {progressError.message?.includes('not found') ? 'Not yet started' : 'Failed to load progress'}
              </Text>
            </View>
          ) : (
            <>
              {/* Image Upload Section */}
              <View className="mb-3">
                <Text className="text-sm font-semibold text-craftopia-textPrimary mb-1.5">
                  Proof of Completion
                </Text>
                <Text className="text-xs text-craftopia-textSecondary mb-3">
                  Take a photo or upload from your gallery as evidence
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

              {/* Upload Status */}
              {isUploading && (
                <View className="flex-row items-center bg-craftopia-info/10 p-3 rounded-lg mb-3">
                  <ActivityIndicator size="small" color="#5D8AA8" />
                  <Text className="text-xs text-craftopia-info ml-2 font-medium">
                    Uploading your image...
                  </Text>
                </View>
              )}

              {imageUrl && !imageUrl.startsWith('file://') && !isUploading && (
                <View className="flex-row items-center bg-craftopia-success/10 p-3 rounded-lg mb-3">
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
                className="rounded-lg"
              />

              {/* Rejection Message */}
              {challengeData?.status === 'rejected' && (
                <View className="mt-3 p-3 bg-craftopia-error/10 rounded-lg border border-craftopia-error/20">
                  <View className="flex-row items-center mb-1.5">
                    <AlertCircle size={14} color="#8B4513" />
                    <Text className="text-xs text-craftopia-error font-semibold ml-1.5">
                      Verification Required
                    </Text>
                  </View>
                  <Text className="text-xs text-craftopia-error">
                    Your previous submission was rejected. Please upload a clearer image that shows your completion of the challenge.
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      )}

      {/* Completed Stats */}
      {isJoined && challengeData?.status === 'completed' && (
        <View className="bg-craftopia-success/5 rounded-2xl border border-craftopia-success/20 p-5 mt-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <CheckCircle size={20} color="#4A7C59" />
              <Text className="text-base font-bold text-craftopia-success ml-2">
                Challenge Completed!
              </Text>
            </View>
            <View className="bg-craftopia-success/20 px-2.5 py-1 rounded-full">
              <Text className="text-craftopia-success text-xs font-semibold">
                +{points} pts
              </Text>
            </View>
          </View>
          
          {challengeData.waste_kg_saved > 0 && (
            <View className="flex-row items-center mt-2 bg-white px-3 py-2 rounded-lg">
              <Leaf size={16} color="#4A7C59" />
              <Text className="text-craftopia-success text-sm font-semibold ml-1.5">
                {challengeData.waste_kg_saved.toFixed(2)} kg waste saved
              </Text>
            </View>
          )}

          {challengeData.verified_at && (
            <Text className="text-xs text-craftopia-textSecondary mt-2">
              Verified on {new Date(challengeData.verified_at).toLocaleDateString()}
            </Text>
          )}
        </View>
      )}
    </View>
  )
}
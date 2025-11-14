// QuestDetail.tsx - UPLOAD ONLY ON SUBMIT
import { Award, Users, Leaf, CheckCircle, Clock, Upload, AlertCircle, PlayCircle, Target } from 'lucide-react-native'
import React, { useState } from 'react'
import { Text, View, ActivityIndicator } from 'react-native'
import Button from '~/components/common/Button'
import { ImageUploadPicker } from '~/components/common/ImageUploadPicker'
import { useUserChallengeProgress, useSubmitChallengeVerification } from '~/hooks/queries/useUserChallenges'
import { useAlert } from '~/hooks/useAlert'
import { useLocalUpload } from '~/hooks/useUpload'

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
  const { uploadToFolder } = useLocalUpload()  // ✅ Add upload hook
  const [imageUri, setImageUri] = useState<string | null>(null)  // ✅ Local URI instead of URL
  const [isUploading, setIsUploading] = useState(false)

  const { 
    data: challengeData, 
    isLoading: progressLoading,
    error: progressError,
    refetch 
  } = useSafeUserChallengeProgress(questId)

  const submitVerificationMutation = useSubmitChallengeVerification()

  React.useEffect(() => {
    if (challengeData?.proof_url && !imageUri) {
      setImageUri(challengeData.proof_url)
    }
  }, [challengeData?.proof_url, imageUri])

  const handleVerify = async () => {
    if (!imageUri) {
      error('Error', 'Please upload a proof image first')
      return
    }
    if (!challengeData?.user_challenge_id) {
      error('Error', 'Challenge data not found. Please try refreshing.')
      return
    }

    try {
      setIsUploading(true)
      let uploadedImageUrl = imageUri

      // ✅ UPLOAD IMAGE ONLY ON SUBMIT
      if (imageUri.startsWith('file://')) {
        console.log('📤 Uploading image to AWS...')
        const url = await uploadToFolder(imageUri, 'challenges')
        if (!url) {
          error('Upload Failed', 'Failed to upload image. Please try again.')
          return
        }
        uploadedImageUrl = url
        console.log('✅ Image uploaded:', uploadedImageUrl)
      }

      // Validate URL format
      if (!uploadedImageUrl.startsWith('http://') && !uploadedImageUrl.startsWith('https://') && !uploadedImageUrl.startsWith('/uploads/')) {
        error('Error', 'Invalid image URL. Please re-upload the image.')
        setImageUri(null)
        return
      }

      await submitVerificationMutation.mutateAsync({
        userChallengeId: challengeData.user_challenge_id,
        proofUrl: uploadedImageUrl,
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
        setImageUri(null)
      } else {
        error('Error', err.message || 'Something went wrong.')
      }
    } finally {
      setIsUploading(false)
    }
  }

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case 'completed':
        return { 
          icon: <CheckCircle size={14} color="#5BA776" />,
          bgColor: 'bg-craftopia-success/10',
          borderColor: 'border-craftopia-success/30',
          textColor: 'text-craftopia-success',
          label: 'COMPLETED'
        }
      case 'pending_verification':
        return { 
          icon: <Clock size={14} color="#E6B655" />,
          bgColor: 'bg-craftopia-accent/10',
          borderColor: 'border-craftopia-accent/30',
          textColor: 'text-craftopia-accent',
          label: 'PENDING'
        }
      case 'rejected':
        return { 
          icon: <AlertCircle size={14} color="#D66B4E" />,
          bgColor: 'bg-craftopia-error/10',
          borderColor: 'border-craftopia-error/30',
          textColor: 'text-craftopia-error',
          label: 'REJECTED'
        }
      case 'in_progress':
        return { 
          icon: <PlayCircle size={14} color="#3B6E4D" />,
          bgColor: 'bg-craftopia-primary/10',
          borderColor: 'border-craftopia-primary/30',
          textColor: 'text-craftopia-primary',
          label: 'IN PROGRESS'
        }
      default:
        return { 
          icon: <Clock size={14} color="#5F6F64" />,
          bgColor: 'bg-craftopia-light',
          borderColor: 'border-craftopia-light',
          textColor: 'text-craftopia-textSecondary',
          label: 'NOT STARTED'
        }
    }
  }

  const getProgressButtonTitle = () => {
    if (submitVerificationMutation.isPending || isUploading) return 'Submitting...'
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
      return !imageUri
    }
    
    return (
      submitVerificationMutation.isPending || 
      isUploading || 
      !imageUri ||
      ['pending_verification', 'completed'].includes(challengeData.status)
    )
  }

  const statusConfig = getStatusConfig(challengeData?.status)

  // Check if image is local file
  const isLocalFile = imageUri?.startsWith('file://')

  if (isLoading) {
    return (
      <View className="mx-4 mt-4">
        <View className="bg-craftopia-surface rounded-xl px-5 py-4 border border-craftopia-light">
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
      {/* Main Quest Card */}
      <View className="bg-craftopia-surface rounded-xl px-5 py-4 border border-craftopia-light mb-3">
        {/* Header Row */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center px-3 py-1.5 rounded-full bg-craftopia-accent/10 border border-craftopia-accent/20">
            <Target size={14} color="#E6B655" />
            <Text className="text-xs font-semibold text-craftopia-accent uppercase tracking-wide ml-1 font-nunito">
              {category}
            </Text>
          </View>
          
          {isJoined && challengeData && (
            <View className={`flex-row items-center px-2.5 py-1 rounded-full border ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
              {statusConfig.icon}
              <Text className={`text-xs font-semibold uppercase tracking-wide ml-1 ${statusConfig.textColor} font-nunito`}>
                {statusConfig.label}
              </Text>
            </View>
          )}
        </View>

        {/* Title & Description */}
        <Text className="text-xl font-bold text-craftopia-textPrimary mb-2 font-poppinsBold">
          {title}
        </Text>
        <Text className="text-sm text-craftopia-textSecondary leading-5 mb-4 font-nunito">
          {description}
        </Text>

        {/* Stats Row */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center bg-craftopia-primary/10 px-3 py-2 rounded-xl">
              <Award size={16} color="#3B6E4D" />
              <Text className="text-base font-bold text-craftopia-primary ml-1.5 font-poppinsBold">
                {points}
              </Text>
              <Text className="text-xs text-craftopia-textSecondary ml-0.5 font-nunito">pts</Text>
            </View>

            {wasteKg > 0 && (
              <View className="flex-row items-center bg-craftopia-success/10 px-3 py-2 rounded-xl">
                <Leaf size={16} color="#5BA776" />
                <Text className="text-base font-bold text-craftopia-success ml-1.5 font-poppinsBold">
                  {wasteKg.toFixed(1)}
                </Text>
                <Text className="text-xs text-craftopia-textSecondary ml-0.5 font-nunito">kg</Text>
              </View>
            )}
          </View>
          
          <View className="flex-row items-center bg-craftopia-light px-3 py-2 rounded-xl">
            <Users size={16} color="#5F6F64" />
            <Text className="text-sm font-bold text-craftopia-textSecondary ml-1.5 font-poppinsBold">
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
            } font-nunito`}>
              {challengeData?.status === 'completed' ? '✅ Quest Completed!' : '✓ Quest Joined'}
            </Text>
          </View>
        )}
      </View>

      {/* Progress Section */}
      {isJoined && challengeData?.status !== 'completed' && (
        <View className="bg-craftopia-surface rounded-xl px-4 py-4 border border-craftopia-light mb-3">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-full bg-craftopia-primary/10 items-center justify-center mr-2">
              <Clock size={16} color="#3B6E4D" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-craftopia-textPrimary font-poppinsBold">
                Your Progress
              </Text>
              <Text className="text-xs text-craftopia-textSecondary font-nunito">
                Upload proof to complete
              </Text>
            </View>
          </View>

          {progressLoading ? (
            <View className="items-center py-4">
              <ActivityIndicator size="small" color="#3B6E4D" />
              <Text className="text-xs text-craftopia-textSecondary mt-2 font-nunito">Loading progress...</Text>
            </View>
          ) : progressError ? (
            <View className="items-center py-4 bg-craftopia-light rounded-lg">
              <AlertCircle size={24} color="#D66B4E" />
              <Text className="text-sm text-craftopia-textSecondary text-center mt-2 font-medium font-nunito">
                {progressError.message?.includes('not found') ? 'Not yet started' : 'Failed to load progress'}
              </Text>
            </View>
          ) : (
            <>
              {/* Image Upload */}
              <View className="mb-3">
                <Text className="text-sm font-semibold text-craftopia-textPrimary mb-1 font-poppinsBold">
                  Proof of Completion
                </Text>
                <Text className="text-xs text-craftopia-textSecondary mb-2 font-nunito">
                  Upload a photo showing your completion
                </Text>
                <ImageUploadPicker
                  label=""
                  description="Tap to upload image"
                  value={imageUri || undefined}
                  onChange={(uri) => setImageUri(uri || null)}
                  disabled={challengeData?.status === 'pending_verification'}
                />
              </View>

              {/* Status Messages */}
              {isLocalFile && (
                <View className="flex-row items-center bg-craftopia-accent/10 px-3 py-2 rounded-lg mb-2">
                  <CheckCircle size={16} color="#E6B655" />
                  <Text className="text-xs text-craftopia-accent ml-2 font-medium font-nunito">
                    Image ready - will upload on submit
                  </Text>
                </View>
              )}

              {imageUri && !isLocalFile && !isUploading && (
                <View className="flex-row items-center bg-craftopia-success/10 px-3 py-2 rounded-lg mb-2">
                  <CheckCircle size={16} color="#5BA776" />
                  <Text className="text-xs text-craftopia-success ml-2 font-medium font-nunito">
                    Image ready for submission
                  </Text>
                </View>
              )}

              {isUploading && (
                <View className="flex-row items-center bg-craftopia-info/10 px-3 py-2 rounded-lg mb-2">
                  <ActivityIndicator size="small" color="#5C89B5" />
                  <Text className="text-xs text-craftopia-info ml-2 font-medium font-nunito">
                    Uploading and submitting...
                  </Text>
                </View>
              )}

              {/* Submit Button */}
              <Button
                title={getProgressButtonTitle()}
                onPress={handleVerify}
                disabled={isProgressDisabled()}
                leftIcon={submitVerificationMutation.isPending || isUploading ? undefined : <Upload size={16} color="#fff" />}
                loading={submitVerificationMutation.isPending || isUploading}
                size="md"
                className="rounded-full"
              />

              {/* Rejection Message */}
              {challengeData?.status === 'rejected' && (
                <View className="mt-3 px-3 py-2.5 bg-craftopia-error/5 rounded-lg border border-craftopia-error/20">
                  <View className="flex-row items-center mb-1">
                    <AlertCircle size={14} color="#D66B4E" />
                    <Text className="text-xs text-craftopia-error font-semibold ml-1.5 font-nunito">
                      Verification Required
                    </Text>
                  </View>
                  <Text className="text-xs text-craftopia-textSecondary font-nunito">
                    Your previous submission was rejected. Please upload a clearer image.
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      )}

      {/* Completed Stats Card */}
      {isJoined && challengeData?.status === 'completed' && (
        <View className="bg-craftopia-success/10 rounded-xl px-4 py-4 border border-craftopia-success/30 mb-3">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-craftopia-success/20 items-center justify-center mr-2">
                <CheckCircle size={16} color="#5BA776" />
              </View>
              <Text className="text-base font-bold text-craftopia-success font-poppinsBold">
                Challenge Completed!
              </Text>
            </View>
            <View className="bg-craftopia-success/20 px-3 py-1 rounded-full">
              <Text className="text-craftopia-success text-xs font-bold font-nunito">
                +{points} pts
              </Text>
            </View>
          </View>
          
          {challengeData.waste_kg_saved > 0 && (
            <View className="flex-row items-center bg-white px-3 py-2 rounded-lg mb-2">
              <Leaf size={16} color="#5BA776" />
              <Text className="text-craftopia-success text-sm font-semibold ml-1.5 font-poppinsBold">
                {challengeData.waste_kg_saved.toFixed(2)} kg waste saved
              </Text>
            </View>
          )}

          {challengeData.verified_at && (
            <Text className="text-xs text-craftopia-textSecondary font-nunito">
              Verified on {new Date(challengeData.verified_at).toLocaleDateString()}
            </Text>
          )}
        </View>
      )}

      {/* Tips Card */}
      <View className="bg-craftopia-light rounded-xl px-3 py-2.5 mb-3">
        <Text className="text-xs font-medium text-craftopia-textPrimary text-center font-nunito">
          💡 Complete challenges to earn points and make an impact!
        </Text>
      </View>
    </View>
  )
}
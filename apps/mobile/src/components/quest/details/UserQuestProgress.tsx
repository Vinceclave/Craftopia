// apps/mobile/src/components/quest/details/UserQuestProgress.tsx - FIXED: Allow re-upload when rejected
import React, { useState } from 'react'
import { Text, View, ActivityIndicator } from 'react-native'
import { CheckCircle, Clock, Upload, Leaf, AlertCircle } from 'lucide-react-native'
import Button from '~/components/common/Button'
import { ImageUploadPicker } from '~/components/common/ImageUploadPicker'
import { useUserChallengeProgress, useSubmitChallengeVerification } from '~/hooks/queries/useUserChallenges'
import { useAlert } from '~/hooks/useAlert'
import { useLocalUpload } from '~/hooks/useUpload'

interface UserQuestProgressProps {
  id: number
  description?: string
  points?: number
  wasteKg?: number
}

export const UserQuestProgress: React.FC<UserQuestProgressProps> = ({
  id,
  description,
  points,
  wasteKg = 0,
}) => {
  const { success, error } = useAlert()
  const { uploadToFolder } = useLocalUpload()
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { 
    data: challengeData, 
    isLoading: loading,
    error: progressError,
    refetch 
  } = useUserChallengeProgress(id)

  const submitVerificationMutation = useSubmitChallengeVerification()

  // ✅ FIXED: Clear old image when rejected, only set for completed/pending
  React.useEffect(() => {
    if (!challengeData) return

    // Clear image URI when status becomes rejected to force new upload
    if (challengeData.status === 'rejected') {
      setImageUri(null)
      return
    }

    // Only set existing proof_url for completed or pending challenges
    if (challengeData.proof_url && !imageUri && 
        (challengeData.status === 'completed' || challengeData.status === 'pending_verification')) {
      setImageUri(challengeData.proof_url)
    }
  }, [challengeData?.proof_url, challengeData?.status])

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
        const url = await uploadToFolder(imageUri, 'challenges')
        if (!url) {
          error('Upload Failed', 'Failed to upload image. Please try again.')
          return
        }
        uploadedImageUrl = url
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
        description: description || '',
        points: points || 0,
        challengeId: id,
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

  const getStatusIcon = () => {
    if (!challengeData) return null
    switch (challengeData.status) {
      case 'completed':
        return <CheckCircle size={14} color="#5BA776" />
      case 'pending_verification':
        return <Clock size={14} color="#E6B655" />
      case 'rejected':
        return <AlertCircle size={14} color="#D66B4E" />
      default:
        return <Clock size={14} color="#5F6F64" />
    }
  }

  const getStatusColor = () => {
    if (!challengeData) return 'text-craftopia-textSecondary'
    switch (challengeData.status) {
      case 'completed': return 'text-craftopia-success'
      case 'rejected': return 'text-craftopia-error'
      case 'pending_verification': return 'text-craftopia-accent'
      default: return 'text-craftopia-textSecondary'
    }
  }

  const getButtonTitle = () => {
    if (submitVerificationMutation.isPending || isUploading) return 'Submitting...'
    if (!challengeData) return 'Submit for Verification'
    switch (challengeData.status) {
      case 'pending_verification': return 'Waiting for Verification'
      case 'completed': return 'Completed ✓'
      case 'rejected': return 'Resubmit Proof'
      default: return 'Submit for Verification'
    }
  }

  // ✅ FIXED: Allow re-upload when rejected
  const isDisabled = () => {
    if (!challengeData) {
      return !imageUri
    }
    
    return (
      submitVerificationMutation.isPending || 
      isUploading || 
      !imageUri ||
      ['pending_verification', 'completed'].includes(challengeData.status)
      // ✅ Removed 'rejected' - rejected challenges can be resubmitted
    )
  }

  // Check if image is local file
  const isLocalFile = imageUri?.startsWith('file://')

  if (progressError && !progressError.message?.includes('not found')) {
    return (
      <View className="mx-4 my-3 p-3 bg-craftopia-surface rounded-lg border border-craftopia-light">
        <Text className="text-sm font-semibold text-craftopia-textPrimary mb-3 font-poppinsBold">Your Progress</Text>
        <View className="items-center py-4">
          <AlertCircle size={24} color="#D66B4E" />
          <Text className="text-sm text-craftopia-error text-center mt-2 font-nunito">
            Failed to load progress
          </Text>
          <Text className="text-xs text-craftopia-textSecondary text-center mt-1 font-nunito">
            {progressError.message}
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

  if (!challengeData && !loading) {
    return null;
  }

  return (
    <View className="mx-4 my-3 p-3 bg-craftopia-surface rounded-lg border border-craftopia-light">
      <Text className="text-sm font-semibold text-craftopia-textPrimary mb-3 font-poppinsBold">Your Progress</Text>

      {loading ? (
        <View className="items-center py-2">
          <ActivityIndicator size="small" color="#3B6E4D" />
          <Text className="text-xs text-craftopia-textSecondary mt-1 font-nunito">Loading progress...</Text>
        </View>
      ) : (
        <>
          {/* ✅ Rejection Message - Show BEFORE upload to make it clear */}
          {challengeData?.status === 'rejected' && (
            <View className="mb-3 px-3 py-2.5 bg-craftopia-error/5 rounded-lg border border-craftopia-error/20">
              <View className="flex-row items-center mb-1">
                <AlertCircle size={14} color="#D66B4E" />
                <Text className="text-xs text-craftopia-error font-semibold ml-1.5 font-nunito">
                  Submission Rejected
                </Text>
              </View>
              <Text className="text-xs text-craftopia-textSecondary font-nunito">
                Your previous submission was rejected. Please upload a clearer image and try again.
              </Text>
            </View>
          )}

          {/* Image Upload */}
          <View className="mb-2">
            <Text className="text-xs text-craftopia-textSecondary mb-2 font-nunito">
              {challengeData?.status === 'rejected' 
                ? '📸 Upload a new, clearer photo to resubmit'
                : 'Upload a photo showing your completion'}
            </Text>
            <ImageUploadPicker
              label="Proof Image"
              description={challengeData?.status === 'rejected' ? 'Tap to upload new image' : 'Upload from camera or gallery'}
              value={imageUri || undefined}
              onChange={(uri) => {
                setImageUri(uri || null)
              }}
              disabled={challengeData?.status === 'completed' || challengeData?.status === 'pending_verification'}
            />
          </View>

          {/* Status Messages */}
          {isLocalFile && (
            <View className="flex-row items-center mt-2 bg-craftopia-accent/10 p-2 rounded">
              <CheckCircle size={14} color="#E6B655" />
              <Text className="text-xs text-craftopia-accent ml-2 font-nunito">
                Image ready - will upload on submit
              </Text>
            </View>
          )}

          {imageUri && !isLocalFile && !isUploading && !challengeData?.verified_at && (
            <View className="flex-row items-center mt-2 bg-craftopia-success/10 p-2 rounded">
              <CheckCircle size={14} color="#5BA776" />
              <Text className="text-xs text-craftopia-success ml-2 font-nunito">
                Image ready for submission
              </Text>
            </View>
          )}

          {isUploading && (
            <View className="flex-row items-center mt-2 bg-craftopia-info/10 p-2 rounded">
              <ActivityIndicator size="small" color="#5C89B5" />
              <Text className="text-xs text-craftopia-info ml-2 font-nunito">
                Uploading and submitting...
              </Text>
            </View>
          )}

          {/* Submit Button */}
          <Button
            title={getButtonTitle()}
            onPress={handleVerify}
            disabled={isDisabled()}
            leftIcon={submitVerificationMutation.isPending || isUploading ? undefined : <Upload size={14} color="#fff" />}
            loading={submitVerificationMutation.isPending || isUploading}
            size="md"
            className="mt-2"
          />

          {/* Status Bar */}
          {challengeData && (
            <View className="flex flex-row mt-3 pt-2 border-t border-craftopia-light items-center justify-between">
              <View className="flex-row items-center">
                {getStatusIcon()}
                <Text className={`text-xs font-medium ml-1 ${getStatusColor()} font-nunito`}>
                  {challengeData.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>

              {challengeData.status === 'completed' && challengeData.waste_kg_saved > 0 && (
                <View className="flex-row items-center bg-craftopia-success/10 px-2 py-1 rounded-full">
                  <Leaf size={12} color="#5BA776" />
                  <Text className="text-xs text-craftopia-success ml-1 font-medium font-nunito">
                    {challengeData.waste_kg_saved.toFixed(2)} kg saved
                  </Text>
                </View>
              )}

              {challengeData.verified_at && challengeData.status === 'completed' && (
                <View className="flex-row items-center">
                  <CheckCircle size={12} color="#5BA776" />
                  <Text className="text-xs text-craftopia-success ml-1 font-nunito">
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
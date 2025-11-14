// apps/mobile/src/components/quest/details/UserQuestProgress.tsx - FIXED VERSION WITH RE-UPLOAD
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
  const { uploadToFolder } = useLocalUpload()  // ✅ Add upload hook
  const [imageUri, setImageUri] = useState<string | null>(null)  // ✅ Store local URI
  const [isUploading, setIsUploading] = useState(false)

  const { 
    data: challengeData, 
    isLoading: loading,
    error: progressError,
    refetch 
  } = useUserChallengeProgress(id)

  const submitVerificationMutation = useSubmitChallengeVerification()

  // Set initial image URI when data loads
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

      console.log('🔍 Submitting verification:', {
        userChallengeId: challengeData.user_challenge_id,
        proofUrl: uploadedImageUrl,
        description,
        points,
        challengeId: id,
      })

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

  const isDisabled = () => {
    if (!challengeData) {
      return !imageUri
    }
    
    return (
      submitVerificationMutation.isPending || 
      isUploading || 
      !imageUri ||
      ['pending_verification', 'completed'].includes(challengeData.status)  // ✅ Removed 'rejected' from disabled states
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
          {/* Image Upload */}
          <View className="mb-2">
            <Text className="text-xs text-craftopia-textSecondary mb-2 font-nunito">
              {challengeData?.status === 'rejected' 
                ? 'Upload a clearer photo to resubmit'
                : 'Upload a photo showing your completion'}
            </Text>
            <ImageUploadPicker
              label="Proof Image"
              description="Upload from camera or gallery"
              value={imageUri || undefined}
              onChange={(uri) => {
                console.log('📸 Image changed:', uri)
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

          {/* Rejection Notice */}
          {challengeData?.status === 'rejected' && (
            <View className="mt-2 p-2 bg-craftopia-error/5 rounded border border-craftopia-error/20">
              <View className="flex-row items-center mb-1">
                <AlertCircle size={14} color="#D66B4E" />
                <Text className="text-xs text-craftopia-error font-medium ml-1 font-nunito">
                  Verification Failed
                </Text>
              </View>
              <Text className="text-xs text-craftopia-textSecondary font-nunito">
                Your previous submission was rejected. Please upload a clearer proof image and resubmit.
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  )
}
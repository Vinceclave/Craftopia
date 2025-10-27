// apps/mobile/src/components/quest/details/UserQuestProgress.tsx - FIXED VERSION
import React, { useState } from 'react'
import { Text, View, ActivityIndicator } from 'react-native'
import { CheckCircle, Clock, Upload, Leaf, AlertCircle } from 'lucide-react-native'
import Button from '~/components/common/Button'
import { ImageUploadPicker } from '~/components/common/ImageUploadPicker'
import { useUserChallengeProgress, useSubmitChallengeVerification } from '~/hooks/queries/useUserChallenges'
import { useAlert } from '~/hooks/useAlert'

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
    // ✅ FIXED: Better validation
    if (!imageUrl) {
      error('Error', 'Please upload a proof image first')
      return
    }

    // ✅ FIXED: Check if image is still uploading
    if (isUploading) {
      error('Error', 'Please wait for image upload to complete')
      return
    }

    // ✅ FIXED: Check if image is still a local file
    if (imageUrl.startsWith('file://')) {
      error('Error', 'Image upload in progress. Please wait...')
      return
    }

    // ✅ FIXED: Validate URL format
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('/uploads/')) {
      error('Error', 'Invalid image URL. Please re-upload the image.')
      return
    }
    
    if (!challengeData?.user_challenge_id) {
      error('Error', 'Challenge data not found. Please try refreshing.')
      return
    }

    try {
      console.log('🔍 Submitting verification:', {
        userChallengeId: challengeData.user_challenge_id,
        proofUrl: imageUrl,
        description,
        points,
        challengeId: id,
      })

      await submitVerificationMutation.mutateAsync({
        userChallengeId: challengeData.user_challenge_id,
        proofUrl: imageUrl,
        description: description || '',
        points: points || 0,
        challengeId: id,
      })
      
      success('Success', 'Challenge submitted for verification!')
      // Refetch to get updated status
      refetch()
    } catch (err: any) {
      console.error('❌ Verification error:', err)
      
      // ✅ FIXED: Better error messages
      if (err.message?.includes('valid uri') || err.message?.includes('URI')) {
        error('Error', 'Invalid image URL. Please re-upload your proof image.')
        setImageUrl(null) // Clear invalid URL
      } else {
        const msg = err.message || 'Something went wrong.'
        error('Error', msg)
      }
    }
  }

  const getStatusIcon = () => {
    if (!challengeData) return null
    switch (challengeData.status) {
      case 'completed':
        return <CheckCircle size={14} color="#16a34a" />
      case 'pending_verification':
        return <Clock size={14} color="#FF6700" />
      case 'rejected':
        return <AlertCircle size={14} color="#ef4444" />
      default:
        return <Clock size={14} color="#6b7280" />
    }
  }

  const getStatusColor = () => {
    if (!challengeData) return 'text-craftopia-textSecondary'
    switch (challengeData.status) {
      case 'completed': return 'text-green-600'
      case 'rejected': return 'text-red-600'
      case 'pending_verification': return 'text-craftopia-accent'
      default: return 'text-craftopia-textSecondary'
    }
  }

  const getButtonTitle = () => {
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

  const isDisabled = () => {
    if (!challengeData) {
      // Not joined yet - disable if no valid uploaded image
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

  // ✅ FIXED: Better error handling
  if (progressError && !progressError.message?.includes('not found')) {
    return (
      <View className="mx-4 my-3 p-3 bg-craftopia-surface rounded-lg border border-craftopia-light">
        <Text className="text-sm font-semibold text-craftopia-textPrimary mb-3">Your Progress</Text>
        <View className="items-center py-4">
          <AlertCircle size={24} color="#ef4444" />
          <Text className="text-sm text-red-500 text-center mt-2">
            Failed to load progress
          </Text>
          <Text className="text-xs text-craftopia-textSecondary text-center mt-1">
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
          {/* ✅ FIXED: Only disable upload after completion, not during pending */}
          <ImageUploadPicker
            label="Proof Image"
            description="Upload from camera or gallery"
            value={imageUrl || undefined}
            onChange={(url) => {
              console.log('📸 Image changed:', url)
              setImageUrl(url || null)
            }}
            folder="challenges"
            onUploadStart={() => {
              console.log('📤 Upload started')
              setIsUploading(true)
            }}
            onUploadComplete={() => {
              console.log('✅ Upload completed')
              setIsUploading(false)
            }}
            disabled={challengeData?.status === 'completed'}
          />

          {/* ✅ NEW: Show upload status */}
          {isUploading && (
            <View className="flex-row items-center mt-2 bg-blue-50 p-2 rounded">
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text className="text-xs text-blue-600 ml-2">Uploading image...</Text>
            </View>
          )}

          {/* ✅ NEW: Show warning if image is still local */}
          {imageUrl && imageUrl.startsWith('file://') && !isUploading && (
            <View className="flex-row items-center mt-2 bg-yellow-50 p-2 rounded">
              <AlertCircle size={14} color="#f59e0b" />
              <Text className="text-xs text-yellow-600 ml-2">
                Image not uploaded yet. Please wait...
              </Text>
            </View>
          )}

          {/* ✅ NEW: Show success indicator when image is uploaded */}
          {imageUrl && !imageUrl.startsWith('file://') && !isUploading && !challengeData?.verified_at && (
            <View className="flex-row items-center mt-2 bg-green-50 p-2 rounded">
              <CheckCircle size={14} color="#16a34a" />
              <Text className="text-xs text-green-600 ml-2">
                Image uploaded successfully
              </Text>
            </View>
          )}

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

              {/* Show waste saved if completed */}
              {challengeData.status === 'completed' && challengeData.waste_kg_saved > 0 && (
                <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full">
                  <Leaf size={12} color="#16a34a" />
                  <Text className="text-xs text-green-600 ml-1 font-medium">
                    {challengeData.waste_kg_saved.toFixed(2)} kg saved
                  </Text>
                </View>
              )}

              {/* Show verified date if completed */}
              {challengeData.verified_at && challengeData.status === 'completed' && (
                <View className="flex-row items-center">
                  <CheckCircle size={12} color="#16a34a" />
                  <Text className="text-xs text-green-600 ml-1">
                    {new Date(challengeData.verified_at).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ✅ NEW: Show rejection reason if rejected */}
          {challengeData?.status === 'rejected' && (
            <View className="mt-2 p-2 bg-red-50 rounded border border-red-200">
              <Text className="text-xs text-red-600 font-medium mb-1">
                Verification Failed
              </Text>
              <Text className="text-xs text-red-500">
                Please upload a clearer proof image and try again.
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  )
}
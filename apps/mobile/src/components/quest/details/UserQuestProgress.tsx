import React, { useEffect, useState } from 'react'
import { Text, View, Alert, ActivityIndicator } from 'react-native'
import { CheckCircle, Clock, Upload } from 'lucide-react-native'
import Button from '~/components/common/Button'
import { ImageUploadPicker } from '~/components/common/ImageUploadPicker'
import { API_ENDPOINTS } from '~/config/api'
import { useAuth } from '~/context/AuthContext'
import { apiService } from '~/services/base.service'

interface UserQuestProgressProps {
  id: number
  description?: string
  points?: number
}

export const UserQuestProgress: React.FC<UserQuestProgressProps> = ({
  id,
  description,
  points,
}) => {
  const { user } = useAuth()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [challengeData, setChallengeData] = useState<any | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    if (!user?.id) return
    setLoading(true)

    try {
      const response = await apiService.request(
        `${API_ENDPOINTS.USER_CHALLENGES.BY_CHALLENGE_ID(id)}?user_id=${user.id}`,
        { method: 'GET' }
      )

      if (response) {
        setChallengeData(response.data)
        if (response.data?.proof_url) {
          setImageUrl(response.data.proof_url)
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch challenge data:', err)
      const msg = err.response?.data?.error || err.message || 'Unable to load progress.'
      Alert.alert('Error', msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData().catch(() => {})
  }, [id, user?.id])

  const handleVerify = async () => {
    if (!imageUrl) {
      Alert.alert('Error', 'Please upload a proof image first')
      return
    }

    if (imageUrl.startsWith('file://')) {
      Alert.alert('Error', 'Please upload the image first')
      return
    }

    setIsVerifying(true)

    try {
      await apiService.request(
        API_ENDPOINTS.USER_CHALLENGES.VERIFY(challengeData.user_challenge_id),
        {
          method: 'POST',
          data: {
            proof_url: imageUrl,
            description,
            points,
            challenge_id: id,
            userId: user?.id,
          },
        }
      )

      Alert.alert('Success', 'Challenge submitted for verification!')
      fetchData()
    } catch (err: any) {
      console.error('Verify request failed:', err)
      const msg = err.response?.data?.error || err.message || 'Something went wrong.'
      Alert.alert('Error', msg)
    } finally {
      setIsVerifying(false)
    }
  }

  const getStatusIcon = () => {
    if (!challengeData) return null

    switch (challengeData.status) {
      case 'completed':
        return <CheckCircle size={14} color="#004E98" />
      default:
        return <Clock size={14} color="#FF6700" />
    }
  }

  const getStatusColor = () => {
    if (!challengeData) return 'text-craftopia-textSecondary'

    switch (challengeData.status) {
      case 'completed':
        return 'text-craftopia-primary'
      case 'rejected':
        return 'text-red-600'
      default:
        return 'text-craftopia-accent'
    }
  }

  const getButtonTitle = () => {
    if (isVerifying || isUploading) return 'Processing...'
    if (!challengeData) return 'Submit for Verification'

    switch (challengeData.status) {
      case 'pending_verification':
        return 'Waiting for Verification'
      case 'completed':
        return 'Completed'
      case 'rejected':
        return 'Challenge Rejected'
      default:
        return 'Submit for Verification'
    }
  }

  const isDisabled = () => {
    if (!challengeData) return false
    return (
      isVerifying ||
      isUploading ||
      !imageUrl ||
      challengeData.status === 'pending_verification' ||
      challengeData.status === 'completed' ||
      challengeData.status === 'rejected' // disable everything if rejected
    )
  }

  return (
    <View className="mx-4 my-3 p-3 bg-craftopia-surface rounded-lg border border-craftopia-light">
      <Text className="text-sm font-semibold text-craftopia-textPrimary mb-3">
        Your Progress
      </Text>

      {loading ? (
        <View className="items-center py-2">
          <ActivityIndicator size="small" color="#004E98" />
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
            disabled={challengeData?.status === 'rejected' || 'completed'}
          />

          <Button
            title={getButtonTitle()}
            onPress={handleVerify}
            disabled={isDisabled()}
            leftIcon={isVerifying || isUploading ? null : <Upload size={14} color="#fff" />}
            size="sm"
            className="mt-2"
          />

          {challengeData && (
            <View className="flex flex-row mt-3 pt-2 border-t border-craftopia-light items-center justify-between">
              <View className="flex-row items-center">
                {getStatusIcon()}
                <Text className={`text-xs font-medium ml-1 ${getStatusColor()}`}>
                  {challengeData.status}
                </Text>
              </View>

              {challengeData.verified_at && (
                <View className="flex-row items-center">
                  <CheckCircle size={12} color="#00A896" />
                  <Text className="text-xs text-craftopia-growth ml-1">
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

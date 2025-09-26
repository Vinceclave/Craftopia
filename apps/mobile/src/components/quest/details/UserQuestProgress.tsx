import React, { useEffect, useState } from 'react';
import { Text, View, Alert, ActivityIndicator } from 'react-native';
import Button from '~/components/common/Button';
import { ImageUploadPicker } from '~/components/common/ImageUploadPicker';
import { API_ENDPOINTS } from '~/config/api';
import { useAuth } from '~/context/AuthContext';
import { apiService } from '~/services/base.service';

interface UserQuestProgressProps {
  id: number;
  description?: string;
  points?: number;
}

export const UserQuestProgress: React.FC<UserQuestProgressProps> = ({
  id,
  description,
  points,
}) => {
  const { user } = useAuth();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [challengeData, setChallengeData] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ fetch challenge data safely
  const fetchData = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const response = await apiService.request(
        `${API_ENDPOINTS.USER_CHALLENGES.BY_CHALLENGE_ID(id)}?user_id=${user.id}`,
        { method: 'GET' }
      );

      if (response) {
        setChallengeData(response.data);
        if (response.proof_url) {
          setImageUrl(response.proof_url);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch challenge data:', err);
      const msg = err.response?.data?.error || err.message || 'Unable to load progress.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ run fetch on mount and when id/user changes
  useEffect(() => {
    let mounted = true;
    fetchData().catch(() => {});

    return () => {
      mounted = false;
    };
  }, [id, user?.id]);

  const handleVerify = async () => {
    if (!imageUrl) {
      Alert.alert('Error', 'Please upload a proof image first');
      return;
    }

    if (imageUrl.startsWith('file://')) {
      Alert.alert('Error', 'Please upload the image first');
      return;
    }

    setIsVerifying(true);

    try {
      const response = await apiService.request(
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
      );

      console.log(response);
      Alert.alert('Success', 'Challenge submitted for verification!');
      fetchData(); // refresh data after verify
    } catch (err: any) {
      console.error('Verify request failed:', err);
      const msg = err.response?.data?.error || err.message || 'Something went wrong.';
      Alert.alert('Error', msg);
    } finally {
      setIsVerifying(false);
    }
  };

  console.log(challengeData)

  return (
    <View className="mx-4 my-3 p-3 bg-craftopia-surface rounded-lg border border-craftopia-light">
      <Text className="text-sm font-semibold text-craftopia-textPrimary mb-3">
        Your Progress
      </Text>

      {loading ? (
        <ActivityIndicator size="small" color="#666" />
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
          />

          <Button
            title={isVerifying || isUploading ? 'Processing...' : 'Verify'}
            onPress={handleVerify}
            disabled={isVerifying || isUploading || !imageUrl}
          />

          {challengeData && (
            <View className="mt-3">
              <Text className="text-xs text-craftopia-textSecondary">
                Status: {challengeData.status}
              </Text>
              {challengeData.verified_at && (
                <Text className="text-xs text-green-600">
                  Verified on {new Date(challengeData.verified_at).toLocaleDateString()}
                </Text>
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
};

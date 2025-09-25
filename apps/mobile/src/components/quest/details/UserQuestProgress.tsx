import React, { useState } from 'react';
import { Text, View, Alert } from 'react-native';
import Button from '~/components/common/Button';
import { ImageUploadPicker } from '~/components/common/ImageUploadPicker';
import { API_ENDPOINTS } from '~/config/api';
import { useAuth } from '~/context/AuthContext';
import { apiService } from '~/services/base.service';

interface UserQuestProgressProps {
  id?: number;
  description?: string | undefined ;
  points?: number;
}

export const UserQuestProgress: React.FC<UserQuestProgressProps> = ({
  id,
  description,
  points,
}) => {
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  console.log(user?.id)

  console.log(imageUrl)

  const handleVerify = async () => {
    if (!imageUrl) {
      Alert.alert("Error", "Please upload a proof image first");
      return;
    }

    // Make sure imageUrl is a valid absolute URL
    if (imageUrl.startsWith('file://')) {
      Alert.alert("Error", "Please upload the image first");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await apiService.request(API_ENDPOINTS.USER_CHALLENGES.VERIFY(id), {
          method: 'POST',
          data: {
            proof_url: imageUrl,
            description: description,
            points: points,
            userId: user.id
          }
      })

      console.log(response)
    } catch (err: any) {
      console.error("Verify request failed:", err);
      const msg = err.response?.data?.error || err.message || "Something went wrong.";
      Alert.alert("Error", msg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <View className="mx-4 my-3 p-3 bg-craftopia-surface rounded-lg border border-craftopia-light">
      <Text className="text-sm font-semibold text-craftopia-textPrimary mb-3">
        Your Progress
      </Text>

      <ImageUploadPicker
        label="Proof Image"
        description="Upload from camera or gallery"
        value={imageUrl}
        onChange={setImageUrl}
        folder="challenges"
        onUploadStart={() => setIsUploading(true)}
        onUploadComplete={() => setIsUploading(false)}
      />

      <Button
        title={isVerifying || isUploading ? "Processing..." : "Verify"}
        onPress={handleVerify}
        disabled={isVerifying || isUploading || !imageUrl}
      />
    </View>
  );
};

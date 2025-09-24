import React, { useState } from 'react';
import { Text, View, Alert } from 'react-native';
import Button from '~/components/common/Button';
import { ImageUploadPicker } from '~/components/common/ImageUploadPicker';
import { API_ENDPOINTS } from '~/config/api';
import { useAuth } from '~/context/AuthContext';
import { apiService } from '~/services/base.service';

interface UserQuestProgressProps {
  id: number;
  description: string;
  points: number;
  imageUrl: string | undefined;
  setImageUrl: (url: string | undefined) => void;
  challengeId?: number; // pass from parent if available
}

export const UserQuestProgress: React.FC<UserQuestProgressProps> = ({
  id,
  description,
  points,
  imageUrl,
  setImageUrl,
  challengeId,
}) => {
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);


  
  console.log('Uploaded image URL:', imageUrl);

  const handleVerify = async () => {
    if (!imageUrl) {
      Alert.alert("Error", "Please upload a proof image first");
      return;
    }

    setIsVerifying(true);

    try {
      // Step 1: Call AI verification endpoint
      const aiResponse = await apiService.request(API_ENDPOINTS.USER_CHALLENGES.VERIFY(id), {
        method: 'POST',
        data: {
          challengeDescription: description,
          imageUrl,
          challengePoints: points,
          userId: user?.id
      }
      }
      );

      console.log("AI Verification result:", aiResponse);


    } catch (err) {
      console.error("Verify request failed:", err);
      Alert.alert("Error", "Failed to verify challenge. Please try again.");
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
      />

      <Button
        title={isVerifying ? "Verifying..." : "Verify"}
        onPress={handleVerify}
        disabled={isVerifying || !imageUrl}
      />
    </View>
  );
};
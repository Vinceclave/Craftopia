import React, { useState } from 'react';
import { Text, View, Alert } from 'react-native';
import Button from '~/components/common/Button';
import { ImageUploadPicker } from '~/components/common/ImageUploadPicker';
import { useAuth } from '~/context/AuthContext';
import { apiService } from '~/services/base.service';

interface UserQuestProgressProps {
  id: number;
  description: string;
  points: number;
  challengeId?: number; // pass from parent if available
}

export const UserQuestProgress: React.FC<UserQuestProgressProps> = ({
  id,
  description,
  points,
  challengeId,
}) => {
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!imageUrl) {
      Alert.alert("Error", "Please upload a proof image first");
      return;
    }

    setIsVerifying(true);

    try {
      // ✅ fixed endpoint: singular "image"
      const aiResponse = await apiService.request('/api/v1/ai/image/verify-upload', {
        method: 'POST',
        data: {
          challengeDescription: description,
          imageUrl,
          challengePoints: points,
          userId: user?.id,
          challengeId: challengeId ?? null,
        },
      });

      console.log("AI Verification result:", aiResponse);
      Alert.alert("Verification Complete", "Check console for results");

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

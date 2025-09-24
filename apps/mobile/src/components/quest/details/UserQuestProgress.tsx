// components/UserQuestProgress.tsx
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { ImageUploadPicker } from '~/components/common/ImageUploadPicker';

export const UserQuestProgress = () => {
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  console.log('Uploaded image URL:', imageUrl);

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
        folder="challenges" // ✅ force upload into challenges
      />
    </View>
  );
};

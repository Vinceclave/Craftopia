import React from 'react';
import { Text, View } from 'react-native';
import { ImageUploadPicker } from '~/components/common/ImageUploadPicker';

interface UserQuestProgressProps {
  description: string
  imageUrl: string | undefined;
  setImageUrl: (url: string | undefined) => void;
}

export const UserQuestProgress: React.FC<UserQuestProgressProps> = ({
  description,
  imageUrl,
  setImageUrl,
}) => {
  console.log('Uploaded image URL:', imageUrl);
  console.log(description)

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
    </View>
  );
};

import React, { memo } from 'react';
import { View, Text, Image } from 'react-native';

interface PostContentProps {
  title: string;
  content: string;
  image_url?: string;
  tags?: string[];
}

export const PostContent: React.FC<PostContentProps> = memo(({ title, content, image_url, tags = [] }) => (
  <View className="mb-2">
    <Text className="font-medium text-craftopia-textPrimary mb-1 text-sm">{title}</Text>
    <Text className="text-craftopia-textSecondary text-sm leading-5 mb-2">{content}</Text>

    {image_url && (
      <Image
        source={{ uri: image_url }}
        className="w-full h-40 rounded-lg mb-2"
        style={{ resizeMode: 'cover' }}
      />
    )}

    {tags.length > 0 && (
      <View className="flex-row mb-2">
        {tags.slice(0, 3).map((tag, idx) => (
          <Text key={`${tag}-${idx}`} className="text-xs text-craftopia-secondary mr-2">#{tag}</Text>
        ))}
      </View>
    )}
  </View>
));

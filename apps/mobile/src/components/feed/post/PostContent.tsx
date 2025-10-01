import React, { memo } from 'react';
import { View, Text, Image } from 'react-native';

interface PostContentProps {
  title: string;
  content: string;
  image_url?: string;
  tags?: string[];
}

export const PostContent: React.FC<PostContentProps> = memo(({ 
  title, 
  content, 
  image_url, 
  tags = [] 
}) => (
  <View className="mb-2">
    {title && (
      <Text className="font-semibold text-craftopia-textPrimary mb-1.5 text-sm">
        {title}
      </Text>
    )}
    
    {content && (
      <Text className="text-craftopia-textSecondary text-sm leading-5 mb-2">
        {content}
      </Text>
    )}

    {image_url && (
      <Image
        source={{ uri: image_url }}
        className="w-full h-32 rounded-lg mb-2"
        resizeMode="cover"
      />
    )}

    {tags.length > 0 && (
      <View className="flex-row flex-wrap mb-1">
        {tags.slice(0, 3).map((tag, idx) => (
          <View 
            key={`${tag}-${idx}`} 
            className="bg-craftopia-light rounded-full px-2 py-1 mr-2 mb-1"
          >
            <Text className="text-xs text-craftopia-primary">#{tag}</Text>
          </View>
        ))}
      </View>
    )}
  </View>
));
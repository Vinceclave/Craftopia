// apps/mobile/src/components/feed/post/PostContent.tsx - FIXED IMAGE
import React, { memo, useState } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';

interface PostContentProps {
  title: string;
  content: string;
  image_url?: string | null;
  tags?: string[];
}

export const PostContent: React.FC<PostContentProps> = memo(({ 
  title, 
  content, 
  image_url, 
  tags = [] 
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <View className="mb-3">
      {title && (
        <Text className="font-semibold text-gray-900 mb-2 text-lg leading-6">
          {title}
        </Text>
      )}
      
      {content && (
        <Text className="text-gray-600 text-base leading-6 mb-3">
          {content}
        </Text>
      )}

      {image_url && !imageError ? (
        <View className="relative w-full h-48 rounded-xl mb-3 overflow-hidden bg-gray-100">
          {imageLoading && (
            <View className="absolute inset-0 items-center justify-center z-10">
              <ActivityIndicator size="small" color="#6B7280" />
            </View>
          )}
          <Image
            source={{ uri: image_url }}
            className="w-full h-48"
            resizeMode="cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </View>
      ) : imageError ? (
        <View className="w-full h-32 rounded-xl mb-3 bg-gray-100 items-center justify-center">
          <Text className="text-gray-400 text-sm">Image not available</Text>
        </View>
      ) : null}

      {tags && tags.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {tags.slice(0, 3).map((tag, idx) => (
            <View 
              key={`${tag}-${idx}`} 
              className="bg-gray-100 rounded-full px-3 py-1.5"
            >
              <Text className="text-xs font-medium text-gray-600">#{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
});

PostContent.displayName = 'PostContent';  
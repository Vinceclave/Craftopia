// apps/mobile/src/components/feed/post/PostContent.tsx - CRAFTOPIA REFINED
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
        <Text className="font-poppinsBold text-craftopia-textPrimary mb-2 text-base leading-6">
          {title}
        </Text>
      )}
      
      {content && (
        <Text className="font-nunito text-craftopia-textSecondary text-sm leading-6 mb-2">
          {content}
        </Text>
      )}

      {image_url && !imageError ? (
        <View className="relative w-full h-40 rounded-xl mb-2 overflow-hidden bg-craftopia-light border border-craftopia-light">
          {imageLoading && (
            <View className="absolute inset-0 items-center justify-center z-10">
              <ActivityIndicator size="small" color="#3B6E4D" />
            </View>
          )}
          <Image
            source={{ uri: image_url }}
            className="w-full h-40"
            resizeMode="cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </View>
      ) : imageError ? (
        <View className="w-full h-32 rounded-xl mb-2 bg-craftopia-light border border-craftopia-light items-center justify-center">
          <Text className="text-craftopia-textSecondary text-sm font-nunito">Image not available</Text>
        </View>
      ) : null}

      {tags && tags.length > 0 && (
        <View className="flex-row flex-wrap gap-1.5">
          {tags.slice(0, 3).map((tag, idx) => (
            <View 
              key={`${tag}-${idx}`} 
              className="bg-craftopia-light rounded-full px-2.5 py-1 border border-craftopia-light"
            >
              <Text className="text-xs font-poppinsBold text-craftopia-textPrimary">#{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
});

PostContent.displayName = 'PostContent';
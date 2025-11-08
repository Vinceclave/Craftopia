// apps/mobile/src/components/feed/post/PostContent.tsx - CRAFTOPIA REDESIGN
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
    <View className="mb-4">
      {title && (
        <Text className="font-poppinsBold text-craftopa-textPrimary mb-2 text-lg leading-6 tracking-tight">
          {title}
        </Text>
      )}
      
      {content && (
        <Text className="font-nunito text-craftopa-textSecondary text-base leading-6 mb-3 tracking-wide">
          {content}
        </Text>
      )}

      {image_url && !imageError ? (
        <View className="relative w-full h-48 rounded-2xl mb-3 overflow-hidden bg-craftopa-light/5 border border-craftopa-light/10">
          {imageLoading && (
            <View className="absolute inset-0 items-center justify-center z-10">
              <ActivityIndicator size="small" color="#5A7160" />
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
        <View className="w-full h-32 rounded-2xl mb-3 bg-craftopa-light/5 border border-craftopa-light/10 items-center justify-center">
          <Text className="text-craftopa-textSecondary text-sm font-nunito tracking-wide">Image not available</Text>
        </View>
      ) : null}

      {tags && tags.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {tags.slice(0, 3).map((tag, idx) => (
            <View 
              key={`${tag}-${idx}`} 
              className="bg-craftopa-light/5 rounded-full px-3 py-1.5 border border-craftopa-light/10"
            >
              <Text className="text-xs font-poppinsBold text-craftopa-textPrimary tracking-tight">#{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
});

PostContent.displayName = 'PostContent';
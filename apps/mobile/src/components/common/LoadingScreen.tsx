// apps/mobile/src/components/LoadingScreen.tsx - Text Only Version
import React, { useEffect, useRef } from 'react';
import { View, Animated, Text, TouchableOpacity } from 'react-native';

interface LoadingScreenProps {
  message?: string;
  onTextPress?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading your Craftopia adventure...',
  onTextPress 
}) => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

  const handleTextPress = () => {
    if (onTextPress) {
      onTextPress();
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-craftopia-background">
      {/* Animated Text Logo */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text className="text-4xl font-poppinsBold text-craftopia-primary mb-8">
          Craftopia
        </Text>
      </Animated.View>
      
      {/* Clickable or Static Message */}
      {onTextPress ? (
        <TouchableOpacity onPress={handleTextPress} activeOpacity={0.7}>
          <Text className="text-craftopia-primary text-base font-nunito text-center underline">
            {message}
          </Text>
        </TouchableOpacity>
      ) : (
        <Animated.Text 
          style={{ opacity: fadeAnim }}
          className="text-craftopia-textPrimary text-base font-nunito text-center"
        >
          {message}
        </Animated.Text>
      )}
    </View>
  );
};
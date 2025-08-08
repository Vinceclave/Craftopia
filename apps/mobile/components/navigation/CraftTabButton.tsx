import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { ViewStyle } from 'react-native';
import { Hammer } from 'lucide-react-native';

const CraftTabButton = () => {
  const scale = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 140,
      mass: 0.9,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          marginTop: -40, // FLOAT ABOVE tab bar
          backgroundColor: '#FF6B00', // ORANGE
          padding: 20,
          borderRadius: 100,
          shadowColor: '#FF6B00',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
          elevation: 10,
        } as ViewStyle,
      ]}
    >
      <Hammer color="#FFFFFF" size={28} />
    </Animated.View>
  );
};

export default CraftTabButton;

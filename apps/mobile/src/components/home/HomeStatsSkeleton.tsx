// Fixed HomeStatsSkeleton.tsx - Remove animate-pulse, use Animated API instead
import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import { TrendingUp } from 'lucide-react-native';

export const HomeStatsSkeleton = () => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, [pulseAnim]);

  const animatedOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View
      style={{ marginTop: -40 }}
      className="mx-4 bg-craftopia-primary rounded-2xl p-4 border border-craftopia-light"
    >
      <View className="flex-row items-center">
        {/* Left: Waste Saved skeleton */}
        <View className="flex-row items-center flex-1">
          <View className="mr-3 bg-craftopia-secondary/20 p-2 rounded-full">
            <TrendingUp size={20} color="#888" />
          </View>
          <View>
            <Animated.View 
              style={{ opacity: animatedOpacity }}
              className="h-4 w-20 bg-craftopia-secondary/30 rounded-md mb-2"
            />
            <Animated.View 
              style={{ opacity: animatedOpacity }}
              className="h-3 w-16 bg-craftopia-secondary/20 rounded-md"
            />
          </View>
        </View>

        {/* Right: Stats skeleton */}
        <View className="flex-row items-center gap-3">
          {/* Points */}
          <View className="items-center bg-craftopia-secondary/20 p-2 rounded-lg">
            <Animated.View 
              style={{ opacity: animatedOpacity }}
              className="h-4 w-12 bg-craftopia-secondary/40 rounded-md mb-1"
            />
            <Animated.View 
              style={{ opacity: animatedOpacity }}
              className="h-3 w-10 bg-craftopia-secondary/20 rounded-md"
            />
          </View>

          {/* Crafts */}
          <View className="items-center bg-craftopia-secondary/20 p-2 rounded-lg">
            <Animated.View 
              style={{ opacity: animatedOpacity }}
              className="h-4 w-8 bg-craftopia-secondary/40 rounded-md mb-1"
            />
            <Animated.View 
              style={{ opacity: animatedOpacity }}
              className="h-3 w-12 bg-craftopia-secondary/20 rounded-md"
            />
          </View>
        </View>
      </View>
    </View>
  );
};
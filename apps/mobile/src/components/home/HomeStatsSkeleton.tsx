// apps/mobile/src/components/home/HomeStatsSkeleton.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import { Leaf, Award } from 'lucide-react-native';

export const HomeStatsSkeleton = () => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1200,
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
    <View className="px-6 pt-6">
      {/* Main Card Skeleton */}
      <View 
        className="bg-white rounded-3xl p-6 mb-4"
        style={{ 
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        {/* Header Skeleton */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Animated.View 
              style={{ 
                opacity: animatedOpacity,
                width: 80,
                height: 12,
                backgroundColor: '#E5E7EB',
                borderRadius: 6,
                marginBottom: 8,
              }}
            />
            <Animated.View 
              style={{ 
                opacity: animatedOpacity,
                width: 140,
                height: 10,
                backgroundColor: '#F3F4F6',
                borderRadius: 5,
              }}
            />
          </View>
          <Animated.View 
            style={{ 
              opacity: animatedOpacity,
              width: 70,
              height: 32,
              backgroundColor: '#F3F4F6',
              borderRadius: 16,
            }}
          />
        </View>

        {/* Primary Stat Skeleton */}
        <View 
          className="rounded-2xl p-5 mb-5"
          style={{ 
            backgroundColor: 'rgba(74, 124, 89, 0.05)',
            borderWidth: 1,
            borderColor: 'rgba(74, 124, 89, 0.1)',
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-3">
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: 'rgba(74, 124, 89, 0.1)' }}
                >
                  <Leaf size={20} color="#9CA3AF" />
                </View>
                <Animated.View 
                  style={{ 
                    opacity: animatedOpacity,
                    width: 90,
                    height: 12,
                    backgroundColor: 'rgba(107, 114, 128, 0.2)',
                    borderRadius: 6,
                  }}
                />
              </View>
              <Animated.View 
                style={{ 
                  opacity: animatedOpacity,
                  width: 120,
                  height: 32,
                  backgroundColor: 'rgba(55, 74, 54, 0.2)',
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              />
              <Animated.View 
                style={{ 
                  opacity: animatedOpacity,
                  width: 140,
                  height: 10,
                  backgroundColor: 'rgba(74, 124, 89, 0.2)',
                  borderRadius: 5,
                }}
              />
            </View>
            
            <View 
              className="w-24 h-24 rounded-full items-center justify-center"
              style={{ backgroundColor: 'rgba(74, 124, 89, 0.05)' }}
            >
              <Animated.View 
                style={{ 
                  opacity: animatedOpacity,
                  width: 48,
                  height: 48,
                  backgroundColor: 'rgba(74, 124, 89, 0.1)',
                  borderRadius: 24,
                }}
              />
            </View>
          </View>
        </View>

        {/* Secondary Stats Grid Skeleton */}
        <View className="flex-row gap-3">
          {[1, 2, 3].map((item) => (
            <View 
              key={item}
              className="flex-1 rounded-xl p-4"
              style={{ backgroundColor: '#F9FAFB' }}
            >
              <View className="flex-row items-center mb-3">
                <View 
                  className="w-8 h-8 rounded-full items-center justify-center mr-2"
                  style={{ backgroundColor: '#E5E7EB' }}
                >
                  <Award size={14} color="#9CA3AF" />
                </View>
                <Animated.View 
                  style={{ 
                    opacity: animatedOpacity,
                    width: 40,
                    height: 10,
                    backgroundColor: '#E5E7EB',
                    borderRadius: 5,
                  }}
                />
              </View>
              <Animated.View 
                style={{ 
                  opacity: animatedOpacity,
                  width: 50,
                  height: 24,
                  backgroundColor: '#D1D5DB',
                  borderRadius: 6,
                  marginBottom: 8,
                }}
              />
              <Animated.View 
                style={{ 
                  opacity: animatedOpacity,
                  width: 60,
                  height: 10,
                  backgroundColor: '#E5E7EB',
                  borderRadius: 5,
                }}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Tip Card Skeleton */}
      <View 
        className="rounded-2xl px-4 py-4 mb-4"
        style={{ 
          backgroundColor: 'rgba(212, 169, 106, 0.05)',
          borderWidth: 1,
          borderColor: 'rgba(212, 169, 106, 0.1)',
        }}
      >
        <View className="flex-row items-center">
          <View 
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: 'rgba(212, 169, 106, 0.1)' }}
          >
            <Animated.View 
              style={{ 
                opacity: animatedOpacity,
                width: 18,
                height: 18,
                backgroundColor: 'rgba(212, 169, 106, 0.3)',
                borderRadius: 9,
              }}
            />
          </View>
          <View className="flex-1">
            <Animated.View 
              style={{ 
                opacity: animatedOpacity,
                width: 70,
                height: 12,
                backgroundColor: 'rgba(26, 26, 26, 0.15)',
                borderRadius: 6,
                marginBottom: 8,
              }}
            />
            <Animated.View 
              style={{ 
                opacity: animatedOpacity,
                width: '90%',
                height: 10,
                backgroundColor: 'rgba(107, 114, 128, 0.15)',
                borderRadius: 5,
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};
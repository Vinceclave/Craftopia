import React, { useEffect, useState } from 'react';
import { Text, View, Animated, Easing, Dimensions } from 'react-native';
import { Leaf, Award, Sparkles, Palette, Trophy, Zap, Target, Recycle, TrendingUp } from 'lucide-react-native';
import { useUserStats } from '~/hooks/useUserStats';
import { useWebSocket } from '~/context/WebSocketContext';
import { WebSocketEvent } from '~/config/websocket';
import { useUserWasteStats } from '~/hooks/queries/useUserChallenges';

export const HomeStats = () => {
  const { data: userStats, refetch } = useUserStats();
  const { on, off, isConnected } = useWebSocket();
  const [animatePoints, setAnimatePoints] = useState(false);
  const [animateWaste, setAnimateWaste] = useState(false);
  
  // Animation values
  const wasteScale = new Animated.Value(1);
  const wastePulse = new Animated.Value(1);
  const glowValue = new Animated.Value(0);
  const pointsScale = new Animated.Value(1);
  
  const { data: wasteStats } = useUserWasteStats();

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
  };

  const stats = {
    wasteSaved: wasteStats?.total_waste_kg?.toFixed(1) || '0.0',
    points: userStats?.points || 0,
    formattedPoints: formatNumber(userStats?.points || 0),
    crafts: userStats?.crafts_created || 0,
    challenges: userStats?.challenges_completed || 0,
  };

  // Enhanced waste animation with pulse
  const triggerWasteAnimation = () => {
    // Scale up animation
    Animated.sequence([
      Animated.timing(wasteScale, {
        toValue: 1.08,
        duration: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(wasteScale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for background
    Animated.sequence([
      Animated.timing(wastePulse, {
        toValue: 1.2,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(wastePulse, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Pop animation for points
  const triggerPointsAnimation = () => {
    Animated.sequence([
      Animated.timing(pointsScale, {
        toValue: 1.15,
        duration: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(pointsScale, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Glow effect for highlights
  const triggerGlow = () => {
    Animated.sequence([
      Animated.timing(glowValue, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(glowValue, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (!isConnected) return;

    const handlePointsAwarded = () => {
      setAnimatePoints(true);
      triggerPointsAnimation();
      triggerGlow();
      setTimeout(() => setAnimatePoints(false), 800);
      refetch();
    };

    const handlePointsUpdated = () => {
      setAnimatePoints(true);
      triggerPointsAnimation();
      triggerGlow();
      setTimeout(() => setAnimatePoints(false), 800);
      refetch();
    };

    const handleChallengeVerified = () => {
      setAnimateWaste(true);
      setAnimatePoints(true);
      triggerWasteAnimation();
      triggerPointsAnimation();
      triggerGlow();
      setTimeout(() => {
        setAnimateWaste(false);
        setAnimatePoints(false);
      }, 800);
      refetch();
    };

    on(WebSocketEvent.POINTS_AWARDED, handlePointsAwarded);
    on(WebSocketEvent.POINTS_UPDATED, handlePointsUpdated);
    on(WebSocketEvent.CHALLENGE_VERIFIED, handleChallengeVerified);

    return () => {
      off(WebSocketEvent.POINTS_AWARDED, handlePointsAwarded);
      off(WebSocketEvent.POINTS_UPDATED, handlePointsUpdated);
      off(WebSocketEvent.CHALLENGE_VERIFIED, handleChallengeVerified);
    };
  }, [isConnected, on, off, refetch]);

  return (
    <View className="px-4 pt-2 pb-3">
      {/* Compact Header */}
      <View className="mb-3">
        <Text className="text-lg font-poppinsBold text-craftopia-textPrimary">
          Your Impact
        </Text>
        <Text className="text-xs font-nunito text-craftopia-textSecondary mt-0.5">
          Making a difference every day
        </Text>
      </View>

      {/* 1/3 Layout: Highlighted Waste Card takes 1 row, others in 2/3 */}
      
      {/* Highlighted Waste Card - Takes full width */}
      <Animated.View 
        className="rounded-2xl p-4 mb-3"
        style={{
          backgroundColor: animateWaste ? '#4F8A63' : '#3B6E4D', // primaryLight : primary
          transform: [{ scale: wasteScale }],
          shadowColor: '#3B6E4D',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center mr-3">
              <Recycle size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text className="text-sm font-nunito text-white/90">
                Total Waste Saved
              </Text>
              <Text className="text-xs font-nunito text-white/70">
                Environmental Impact
              </Text>
            </View>
          </View>
          
          <Animated.View
            style={{
              opacity: glowValue.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.8],
              }),
              transform: [
                {
                  rotate: glowValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '15deg'],
                  }),
                },
              ],
            }}
          >
            <Sparkles size={16} color="#F1C977" />
          </Animated.View>
        </View>
        
        {/* Highlighted Waste Number */}
        <View className="flex-row items-end">
          <Text className="text-3xl font-poppinsBold text-white">
            {stats.wasteSaved}
          </Text>
          <Text className="text-lg font-nunito text-white/90 ml-2 mb-1">
            kilograms
          </Text>
        </View>
        
        {/* Waste Progress Indicator */}
        <View className="mt-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs font-nunito text-white/80">
              This month's goal: 25 kg
            </Text>
            <Text className="text-xs font-nunitoBold text-white">
              {((parseFloat(stats.wasteSaved) / 25) * 100).toFixed(0)}%
            </Text>
          </View>
          <View className="h-2 rounded-full bg-white/20 overflow-hidden">
            <Animated.View 
              className="h-full rounded-full bg-craftopia-accentLight"
              style={{
                width: `${Math.min((parseFloat(stats.wasteSaved) / 25) * 100, 100)}%`,
              }}
            />
          </View>
        </View>
      </Animated.View>

      {/* Secondary Stats - 3 cards in a row */}
      <View className="flex-row gap-2">
        {/* Points Card */}
        <Animated.View 
          className="flex-1 rounded-2xl p-3"
          style={{
            backgroundColor: '#FFFFFF',
            transform: [{ scale: pointsScale }],
            shadowColor: '#E6B655',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: animatePoints ? 0.25 : 0.15,
            shadowRadius: 8,
            elevation: 4,
            borderWidth: 1,
            borderColor: animatePoints ? '#F1C977' : '#F5F7F2',
          }}
        >
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 rounded-lg bg-craftopia-accent/15 items-center justify-center mr-2">
              <Zap size={16} color="#E6B655" />
            </View>
            <Text className="text-xs font-nunito text-craftopia-textSecondary">
              Points
            </Text>
          </View>
          
          <Text className="text-xl font-poppinsBold text-craftopia-textPrimary">
            {stats.formattedPoints}
          </Text>
          
          <View className="flex-row items-center mt-1">
            <TrendingUp size={10} color="#5BA776" />
            <Text className="text-xs font-nunito text-craftopia-success ml-1">
              +{Math.floor((userStats?.points || 0) * 0.1)} today
            </Text>
          </View>
        </Animated.View>

        {/* Crafts Card */}
        <View className="flex-1 rounded-2xl p-3 bg-white"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
            borderWidth: 1,
            borderColor: '#F5F7F2',
          }}
        >
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 rounded-lg bg-craftopia-secondary/15 items-center justify-center mr-2">
              <Palette size={16} color="#89A67E" />
            </View>
            <Text className="text-xs font-nunito text-craftopia-textSecondary">
              Crafts
            </Text>
          </View>
          
          <Text className="text-xl font-poppinsBold text-craftopia-textPrimary">
            {stats.crafts}
          </Text>
          
          <Text className="text-xs font-nunito text-craftopia-textSecondary mt-1">
            Saved
          </Text>
        </View>

        {/* Challenges Card */}
        <View className="flex-1 rounded-2xl p-3 bg-white"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
            borderWidth: 1,
            borderColor: '#F5F7F2',
          }}
        >
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 rounded-lg bg-craftopia-primary/15 items-center justify-center mr-2">
              <Target size={16} color="#3B6E4D" />
            </View>
            <Text className="text-xs font-nunito text-craftopia-textSecondary">
              Quests
            </Text>
          </View>
          
          <Text className="text-xl font-poppinsBold text-craftopia-textPrimary">
            {stats.challenges}
          </Text>
          
          <Text className="text-xs font-nunito text-craftopia-textSecondary mt-1">
            Completed
          </Text>
        </View>
      </View>

      {/* Colorful decorative elements using all brand colors */}
      <View className="flex-row justify-center mt-3 gap-2">
        <View className="w-2 h-2 rounded-full bg-craftopia-primary" />
        <View className="w-2 h-2 rounded-full bg-craftopia-accent" />
        <View className="w-2 h-2 rounded-full bg-craftopia-secondary" />
        <View className="w-2 h-2 rounded-full bg-craftopia-success" />
        <View className="w-2 h-2 rounded-full bg-craftopia-info" />
      </View>
    </View>
  );
};
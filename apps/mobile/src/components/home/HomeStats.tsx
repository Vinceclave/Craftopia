import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Text, View, Animated, Easing, Platform, Pressable } from 'react-native';
import { Sparkles, Palette, Zap, Target, Recycle, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStats } from '~/hooks/useUserStats';
import { useWebSocket } from '~/context/WebSocketContext';
import { WebSocketEvent } from '~/config/websocket';
import { useUserWasteStats } from '~/hooks/queries/useUserChallenges';

export const HomeStats = () => {
  const { data: userStats, refetch } = useUserStats();
  const { on, off, isConnected } = useWebSocket();
  const { data: wasteStats } = useUserWasteStats();

  const [animatePoints, setAnimatePoints] = useState(false);
  const [animateWaste, setAnimateWaste] = useState(false);

  // Animation values - Fixed: Using useRef to persist values across renders
  const wasteScale = useRef(new Animated.Value(1)).current;
  const wastePulse = useRef(new Animated.Value(1)).current;
  const glowValue = useRef(new Animated.Value(0)).current;
  const pointsScale = useRef(new Animated.Value(1)).current;

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

  const stats = useMemo(() => ({
    wasteSaved: wasteStats?.total_waste_kg?.toFixed(1) || '0.0',
    points: userStats?.points || 0,
    formattedPoints: formatNumber(userStats?.points || 0),
    crafts: userStats?.crafts_created || 0,
    challenges: userStats?.challenges_completed || 0,
    wasteGoal: 25 // Configurable goal
  }), [wasteStats, userStats]);

  // Enhanced waste animation with pulse
  const triggerWasteAnimation = () => {
    // Scale up animation
    Animated.sequence([
      Animated.timing(wasteScale, {
        toValue: 1.05,
        duration: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(wasteScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for background
    Animated.sequence([
      Animated.timing(wastePulse, {
        toValue: 1.1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true, // Native driver supported for transform/opacity
      }),
      Animated.timing(wastePulse, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Pop animation for points
  const triggerPointsAnimation = () => {
    Animated.sequence([
      Animated.timing(pointsScale, {
        toValue: 1.1,
        duration: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(pointsScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Glow effect for highlights
  const triggerGlow = () => {
    glowValue.setValue(0);
    Animated.sequence([
      Animated.timing(glowValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(glowValue, {
        toValue: 0,
        duration: 500,
        easing: Easing.in(Easing.quad),
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

  // Calculate progress percentage, capped at 100%
  const progressPercent = Math.min((parseFloat(stats.wasteSaved) / stats.wasteGoal) * 100, 100);

  return (
    <View className="px-5 mb-2">
      {/* Section Header */}
      <View className="mb-4 flex-row items-end justify-between">
        <View>
          <Text className="text-lg font-poppinsBold text-craftopia-textPrimary leading-tight">
            Your Impact
          </Text>
          <Text className="text-xs font-nunito text-craftopia-textSecondary mt-0.5">
            Consistency is key
          </Text>
        </View>
        <Pressable hitSlop={8}>
          <Text className="text-xs font-nunitoBold text-craftopia-primary">View History</Text>
        </Pressable>
      </View>

      {/* Main Stats Card - Waste Saved */}
      <Animated.View
        style={{
          transform: [{ scale: wasteScale }],
          shadowColor: '#3B6E4D',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        }}
        className="mb-4"
      >
        <LinearGradient
          colors={['#3B6E4D', '#2d543b']} // Deep elegant green gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-3xl p-5 overflow-hidden relative"
        >
          {/* Decorative background elements */}
          <View className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
          <View className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8" />

          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-white/15 items-center justify-center mr-3 border border-white/10">
                <Recycle size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text className="text-sm font-poppinsMedium text-white/95">
                  Waste Diverted
                </Text>
                <Text className="text-[10px] font-nunito text-white/70 uppercase tracking-wider">
                  Total Impact
                </Text>
              </View>
            </View>

            <Animated.View
              style={{
                opacity: glowValue,
                transform: [{
                  rotate: glowValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '45deg']
                  })
                }]
              }}
            >
              <Sparkles size={20} color="#F1C977" fill="#F1C977" />
            </Animated.View>
          </View>

          <View className="flex-row items-baseline mb-4">
            <Text className="text-4xl font-poppinsBold text-white shadow-sm">
              {stats.wasteSaved}
            </Text>
            <Text className="text-base font-nunitoMedium text-white/80 ml-1.5 mb-1">
              kg
            </Text>
          </View>

          {/* Progress Bar */}
          <View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-xs font-nunitoMedium text-white/80">
                Monthly Goal: {stats.wasteGoal}kg
              </Text>
              <Text className="text-xs font-poppinsBold text-white">
                {progressPercent.toFixed(0)}%
              </Text>
            </View>
            <View className="h-2.5 rounded-full bg-black/20 overflow-hidden backdrop-blur-sm border border-white/5">
              <Animated.View
                className="h-full rounded-full bg-craftopia-accentLight"
                style={{ width: `${progressPercent}%` }}
              />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Secondary Stats Grid - Symmetrical Layout */}
      <View className="flex-row gap-3">
        {/* Points Card */}
        <Animated.View
          className="flex-1 rounded-2xl bg-white p-3.5 border border-craftopia-light/60 shadow-sm"
          style={{
            transform: [{ scale: pointsScale }],
            shadowColor: '#E6B655',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: animatePoints ? 0.2 : 0.05,
            shadowRadius: 4,
            elevation: 2,
            borderColor: animatePoints ? '#F1C977' : '#e5e7eb',
          }}
        >
          <View className="w-8 h-8 rounded-full bg-craftopia-accent/10 items-center justify-center mb-2.5">
            <Zap size={16} color="#D4A017" fill={animatePoints ? "#D4A017" : "transparent"} />
          </View>
          <Text className="text-xs font-nunito font-bold text-craftopia-textSecondary uppercase tracking-wide mb-1">
            Points
          </Text>
          <Text className="text-xl font-poppinsBold text-craftopia-textPrimary">
            {stats.formattedPoints}
          </Text>
          <View className="flex-row items-center mt-1">
            <TrendingUp size={10} color="#3B6E4D" />
            <Text className="text-[10px] font-nunitoBold text-craftopia-primary ml-1">
              On track
            </Text>
          </View>
        </Animated.View>

        {/* Crafts Card */}
        <View className="flex-1 rounded-2xl bg-white p-3.5 border border-craftopia-light/60 shadow-sm shadow-black/5 elevation-2">
          <View className="w-8 h-8 rounded-full bg-craftopia-secondary/10 items-center justify-center mb-2.5">
            <Palette size={16} color="#89A67E" />
          </View>
          <Text className="text-xs font-nunito font-bold text-craftopia-textSecondary uppercase tracking-wide mb-1">
            Crafts
          </Text>
          <Text className="text-xl font-poppinsBold text-craftopia-textPrimary">
            {stats.crafts}
          </Text>
        </View>

        {/* Quests Card */}
        <View className="flex-1 rounded-2xl bg-white p-3.5 border border-craftopia-light/60 shadow-sm shadow-black/5 elevation-2">
          <View className="w-8 h-8 rounded-full bg-craftopia-primary/10 items-center justify-center mb-2.5">
            <Target size={16} color="#3B6E4D" />
          </View>
          <Text className="text-xs font-nunito font-bold text-craftopia-textSecondary uppercase tracking-wide mb-1">
            Quests
          </Text>
          <Text className="text-xl font-poppinsBold text-craftopia-textPrimary">
            {stats.challenges}
          </Text>
        </View>
      </View>
    </View>
  );
};
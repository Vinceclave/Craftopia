import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Leaf, Award, ChevronRight, Sparkles, Palette, Trophy } from 'lucide-react-native';
import { useUserStats } from '~/hooks/useUserStats';
import { useWebSocket } from '~/context/WebSocketContext';
import { WebSocketEvent } from '~/config/websocket';
import { useUserWasteStats } from '~/hooks/queries/useUserChallenges';

export const HomeStats = () => {
  const { data: userStats, refetch } = useUserStats();
  const { on, off, isConnected } = useWebSocket();
  const [animatePoints, setAnimatePoints] = useState(false);
  const [animateWaste, setAnimateWaste] = useState(false);

  const stats = {
    wasteSaved: ((userStats?.points || 0) * 0.1).toFixed(1),
    points: userStats?.points || 0,
    crafts: userStats?.crafts_created || 0,
    challenges: userStats?.challenges_completed || 0,
  };

  const { data: wasteStats } = useUserWasteStats();

  useEffect(() => {
    if (!isConnected) return;

    const handlePointsAwarded = (data: any) => {
      setAnimatePoints(true);
      setTimeout(() => setAnimatePoints(false), 1000);
      refetch();
    };

    const handlePointsUpdated = (data: any) => {
      setAnimatePoints(true);
      setTimeout(() => setAnimatePoints(false), 1000);
      refetch();
    };

    const handleChallengeVerified = (data: any) => {
      setAnimateWaste(true);
      setAnimatePoints(true);
      setTimeout(() => {
        setAnimateWaste(false);
        setAnimatePoints(false);
      }, 1000);
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
    <View className="px-5 pt-2 pb-3">
      {/* Main Impact Card */}
      <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-craftopa-light/5">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-xs font-nunito text-craftopa-textSecondary tracking-wide mb-0.5">
              Your Impact
            </Text>
            <Text className="text-base font-poppinsBold text-craftopa-textPrimary tracking-tight">
              Making a Difference 🌍
            </Text>
          </View>
          <TouchableOpacity 
            className="flex-row items-center px-3 py-1.5 rounded-lg active:opacity-70"
            style={{ backgroundColor: 'rgba(90, 113, 96, 0.08)' }}
          >
            <Text className="text-xs font-poppinsBold mr-1 text-craftopa-textPrimary">
              Insights
            </Text>
            <ChevronRight size={12} color="#5A7160" />
          </TouchableOpacity>
        </View>

        {/* Primary Stat - Waste Saved */}
        <View 
          className="rounded-xl p-3 mb-3 bg-gradient-to-r from-craftopa-accent/5 to-craftopa-primary/3 border border-craftopa-light/10"
          style={{ 
            transform: animateWaste ? [{ scale: 1.02 }] : [{ scale: 1 }],
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 rounded-lg bg-white shadow-sm items-center justify-center mr-2 border border-craftopa-light/5">
                  <Leaf size={18} color="#5A7160" />
                </View>
                <View>
                  <Text className="text-xs font-nunito text-craftopa-textSecondary tracking-wide">
                    Waste Diverted
                  </Text>
                  <Text className="text-2xl font-poppinsBold text-craftopa-textPrimary tracking-tight mt-0.5">
                    {stats.wasteSaved}
                    <Text className="text-sm font-nunito text-craftopa-textSecondary"> kg</Text>
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center mt-1">
                <Sparkles size={12} color="#5A7160" />
                <Text className="text-xs font-nunito ml-1.5 text-craftopa-textPrimary">
                  {animateWaste ? 'Impact updated! ✨' : 'Creating positive change'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Secondary Stats Grid */}
        <View className="flex-row gap-2">
          {/* Points Card */}
          <View 
            className="flex-1 rounded-lg p-2.5 bg-white border border-craftopa-light/5 shadow-sm"
            style={{ 
              transform: animatePoints ? [{ scale: 1.05 }] : [{ scale: 1 }],
              backgroundColor: animatePoints ? 'rgba(212, 169, 106, 0.08)' : '#FFFFFF',
            }}
          >
            <View className="flex-row items-center mb-1.5">
              <View className="w-7 h-7 rounded-lg bg-craftopa-accent/10 items-center justify-center mr-1.5">
                <Award size={14} color="#D4A96A" />
              </View>
              <Text className="text-xs font-nunito text-craftopa-textSecondary tracking-wide">
                Points
              </Text>
            </View>
            <Text className="text-lg font-poppinsBold text-craftopa-textPrimary mb-0.5 tracking-tight">
              {stats.points}
            </Text>
            <Text className="text-xs font-nunito text-craftopa-textSecondary tracking-wide">
              +{Math.floor(stats.points * 0.1)} today
            </Text>
          </View>

          {/* Crafts Card */}
          <View className="flex-1 rounded-lg p-2.5 bg-white border border-craftopa-light/5 shadow-sm">
            <View className="flex-row items-center mb-1.5">
              <View className="w-7 h-7 rounded-lg bg-purple-500/10 items-center justify-center mr-1.5">
                <Palette size={14} color="#9333EA" />
              </View>
              <Text className="text-xs font-nunito text-craftopa-textSecondary tracking-wide">
                Crafts
              </Text>
            </View>
            <Text className="text-lg font-poppinsBold text-craftopa-textPrimary mb-0.5 tracking-tight">
              {stats.crafts}
            </Text>
            <Text className="text-xs font-nunito text-craftopa-textSecondary tracking-wide">
              Created
            </Text>
          </View>

          {/* Quests Card */}
          <View className="flex-1 rounded-lg p-2.5 bg-white border border-craftopa-light/5 shadow-sm">
            <View className="flex-row items-center mb-1.5">
              <View className="w-7 h-7 rounded-lg bg-craftopa-primary/10 items-center justify-center mr-1.5">
                <Trophy size={14} color="#5A7160" />
              </View>
              <Text className="text-xs font-nunito text-craftopa-textSecondary tracking-wide">
                Quests
              </Text>
            </View>
            <Text className="text-lg font-poppinsBold text-craftopa-textPrimary mb-0.5 tracking-tight">
              {stats.challenges}
            </Text>
            <Text className="text-xs font-nunito text-craftopa-textSecondary tracking-wide">
              Completed
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
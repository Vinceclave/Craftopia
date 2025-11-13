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
    <View className="px-4 pt-2 pb-3">
      {/* Main Impact Card */}
      <View className="bg-craftopia-surface rounded-xl p-4 mb-3 border border-craftopia-light">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-xs font-nunito text-craftopia-textSecondary mb-1">
              Your Impact
            </Text>
            <Text className="text-base font-poppinsBold text-craftopia-textPrimary">
              Making a Difference 🌍
            </Text>
          </View>
          <TouchableOpacity 
            className="flex-row items-center px-3 py-1.5 rounded-lg bg-craftopia-primary/10 active:opacity-70"
          >
            <Text className="text-xs font-poppinsBold mr-1 text-craftopia-textPrimary">
              Insights
            </Text>
            <ChevronRight size={12} color="#3B6E4D" />
          </TouchableOpacity>
        </View>

        {/* Primary Stat - Waste Saved */}
        <View 
          className="rounded-xl p-3 mb-3 bg-craftopia-primary/5 border border-craftopia-primary/20"
          style={{ 
            transform: animateWaste ? [{ scale: 1.02 }] : [{ scale: 1 }],
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 rounded-lg bg-craftopia-surface items-center justify-center mr-3 border border-craftopia-light">
                  <Leaf size={16} color="#3B6E4D" />
                </View>
                <View>
                  <Text className="text-xs font-nunito text-craftopia-textSecondary">
                    Waste Diverted
                  </Text>
                  <Text className="text-xl font-poppinsBold text-craftopia-textPrimary mt-0.5">
                    {stats.wasteSaved}
                    <Text className="text-sm font-nunito text-craftopia-textSecondary"> kg</Text>
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center mt-1">
                <Sparkles size={12} color="#3B6E4D" />
                <Text className="text-xs font-nunito ml-1.5 text-craftopia-textPrimary">
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
            className="flex-1 rounded-lg p-2.5 bg-craftopia-surface border border-craftopia-light"
            style={{ 
              transform: animatePoints ? [{ scale: 1.05 }] : [{ scale: 1 }],
              backgroundColor: animatePoints ? 'rgba(227, 168, 79, 0.08)' : '#FFFFFF',
            }}
          >
            <View className="flex-row items-center mb-1.5">
              <View className="w-7 h-7 rounded-lg bg-craftopia-warning/10 items-center justify-center mr-1.5">
                <Award size={14} color="#E3A84F" />
              </View>
              <Text className="text-xs font-nunito text-craftopia-textSecondary">
                Points
              </Text>
            </View>
            <Text className="text-base font-poppinsBold text-craftopia-textPrimary mb-0.5">
              {stats.points}
            </Text>
            <Text className="text-xs font-nunito text-craftopia-textSecondary">
              +{Math.floor(stats.points * 0.1)} today
            </Text>
          </View>

          {/* Crafts Card */}
          <View className="flex-1 rounded-lg p-2.5 bg-craftopia-surface border border-craftopia-light">
            <View className="flex-row items-center mb-1.5">
              <View className="w-7 h-7 rounded-lg bg-craftopia-secondary/10 items-center justify-center mr-1.5">
                <Palette size={14} color="#89A67E" />
              </View>
              <Text className="text-xs font-nunito text-craftopia-textSecondary">
                Crafts
              </Text>
            </View>
            <Text className="text-base font-poppinsBold text-craftopia-textPrimary mb-0.5">
              {stats.crafts}
            </Text>
            <Text className="text-xs font-nunito text-craftopia-textSecondary">
              Created
            </Text>
          </View>

          {/* Quests Card */}
          <View className="flex-1 rounded-lg p-2.5 bg-craftopia-surface border border-craftopia-light">
            <View className="flex-row items-center mb-1.5">
              <View className="w-7 h-7 rounded-lg bg-craftopia-primary/10 items-center justify-center mr-1.5">
                <Trophy size={14} color="#3B6E4D" />
              </View>
              <Text className="text-xs font-nunito text-craftopia-textSecondary">
                Quests
              </Text>
            </View>
            <Text className="text-base font-poppinsBold text-craftopia-textPrimary mb-0.5">
              {stats.challenges}
            </Text>
            <Text className="text-xs font-nunito text-craftopia-textSecondary">
              Completed
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
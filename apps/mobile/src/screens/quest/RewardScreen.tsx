// apps/mobile/src/screens/RewardsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { 
  Gift, 
  Award, 
  AlertCircle, 
  TrendingUp, 
  History,
  Zap,
  Star,
  Clock
} from 'lucide-react-native';
import { useUserStats } from '~/hooks/useUserStats';
import { Reward } from '~/services/reward.service';
import { RewardCard } from '~/components/quest/rewards/RewardCard';
import { useRedeemReward, useRewards } from '~/hooks/useRewards';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EcoQuestStackParamList } from '~/navigations/types';

export const RewardsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<EcoQuestStackParamList>>()
  const [refreshing, setRefreshing] = useState(false);

  // Get user stats for points balance
  const { 
    data: userStats, 
    isLoading: statsLoading,
    refetch: refetchStats
  } = useUserStats();

  // Get rewards list
  const {
    data: rewardsData,
    isLoading: rewardsLoading,
    error: rewardsError,
    refetch: refetchRewards,
    isRefetching,
  } = useRewards(1, 20, {
    activeOnly: true,
    availableOnly: false,
  });

  // Redeem reward mutation
  const redeemMutation = useRedeemReward();

  const userPoints = userStats?.points || 0;
  const rewards = rewardsData?.data || [];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchRewards(), refetchStats()]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRewardPress = (reward: Reward) => {
    // Show reward details and redemption option
    Alert.alert(
      reward.title,
      `${reward.description || 'No description available'}\n\nCost: ${reward.points_cost} points\nSponsor: ${reward.sponsor.name}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Redeem', 
          style: 'default',
          onPress: () => handleRedeemReward(reward)
        }
      ]
    );
  };

  const handleRedeemReward = (reward: Reward) => {
    if (userPoints < reward.points_cost) {
      Alert.alert(
        'Insufficient Points',
        `You need ${reward.points_cost} points to redeem this reward, but you only have ${userPoints} points.`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    Alert.alert(
      'Confirm Redemption',
      `Are you sure you want to redeem "${reward.title}" for ${reward.points_cost} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Redeem', 
          style: 'destructive',
          onPress: () => confirmRedeemReward(reward)
        }
      ]
    );
  };

  const confirmRedeemReward = async (reward: Reward) => {
    try {
      await redeemMutation.mutateAsync(reward.reward_id);
      
      Alert.alert(
        'Redemption Successful!',
        `You have successfully redeemed "${reward.title}". You will be notified when your reward is ready.`,
        [
          { 
            text: 'View History', 
            onPress: () => navigation.navigate('RedemptionHistory')
          },
          { text: 'Continue Browsing', style: 'cancel' }
        ]
      );

      // Refresh data
      refetchRewards();
      refetchStats();
    } catch (error: any) {
      Alert.alert(
        'Redemption Failed',
        error?.message || 'Failed to redeem reward. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const getPointsTier = () => {
    if (userPoints >= 1000) return { label: 'Elite', color: '#E6B655', icon: Star };
    if (userPoints >= 500) return { label: 'Advanced', color: '#5BA776', icon: Zap };
    if (userPoints >= 100) return { label: 'Intermediate', color: '#3B6E4D', icon: TrendingUp };
    return { label: 'Beginner', color: '#5F6F64', icon: Award };
  };

  const pointsTier = getPointsTier();
  const TierIcon = pointsTier.icon;

  const isLoading = rewardsLoading && !isRefetching;
  const isRedeeming = redeemMutation.isPending;

  // Group rewards by category or points cost
  const featuredRewards = rewards.filter(reward => reward.points_cost >= 500);
  const regularRewards = rewards.filter(reward => reward.points_cost < 500);

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-background">
      {/* Header */}
      <View className="px-4 pt-4 pb-4 bg-craftopia-surface border-b border-craftopia-light">
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-1">
            <Text className="text-xs text-craftopia-textSecondary uppercase tracking-wider mb-1 font-nunito">
              Rewards Shop
            </Text>
            <Text className="text-xl font-bold text-craftopia-textPrimary font-poppinsBold">
              Redeem Your Points
            </Text>
          </View>
          
          {/* History Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('RedemptionHistory')}
            className="flex-row items-center bg-craftopia-light rounded-full px-3 py-2 ml-2"
          >
            <History size={16} color="#3B6E4D" />
            <Text className="text-xs font-semibold text-craftopia-primary ml-1 font-nunito">
              History
            </Text>
          </TouchableOpacity>
        </View>

        {/* Points Balance Card */}
        <View className="bg-craftopia-light rounded-xl px-4 py-4 border border-craftopia-accent/20">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-craftopia-primary/20 items-center justify-center mr-3">
                <Award size={24} color="#3B6E4D" />
              </View>
              <View>
                <Text className="text-xs text-craftopia-textSecondary font-nunito">
                  Your Balance
                </Text>
                <Text className="text-2xl font-bold text-craftopia-primary font-poppinsBold">
                  {statsLoading ? '...' : userPoints.toLocaleString()}
                </Text>
                <View className="flex-row items-center mt-1">
                  <TierIcon size={12} color={pointsTier.color} />
                  <Text 
                    className="text-xs font-semibold ml-1 font-nunito"
                    style={{ color: pointsTier.color }}
                  >
                    {pointsTier.label} Tier
                  </Text>
                </View>
              </View>
            </View>
            
            <View className="items-end">
              <View className="flex-row items-center bg-craftopia-success/10 px-2 py-1 rounded-lg mb-2">
                <TrendingUp size={12} color="#5BA776" />
                <Text className="text-xs text-craftopia-success ml-1 font-nunito">
                  Active Earner
                </Text>
              </View>
              <Text className="text-xs text-craftopia-textSecondary font-nunito">
                Updated just now
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row justify-between mt-3">
          <View className="items-center">
            <Text className="text-xs text-craftopia-textSecondary font-nunito">Available</Text>
            <Text className="text-sm font-bold text-craftopia-textPrimary font-poppinsBold">
              {rewards.length}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-xs text-craftopia-textSecondary font-nunito">Affordable</Text>
            <Text className="text-sm font-bold text-craftopia-textPrimary font-poppinsBold">
              {rewards.filter(r => r.points_cost <= userPoints).length}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-xs text-craftopia-textSecondary font-nunito">Featured</Text>
            <Text className="text-sm font-bold text-craftopia-textPrimary font-poppinsBold">
              {featuredRewards.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B6E4D"
            colors={['#3B6E4D']}
          />
        }
      >
        <View className="px-4 py-4">
          {/* Global Loading State for Redemption */}
          {isRedeeming && (
            <View className="bg-craftopia-accent/10 rounded-xl p-4 mb-4 border border-craftopia-accent/20">
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#E6B655" />
                <Text className="text-sm font-semibold text-craftopia-accent ml-2 font-nunito">
                  Processing your redemption...
                </Text>
              </View>
            </View>
          )}

          {/* Featured Rewards Section */}
          {featuredRewards.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-xl bg-craftopia-accent/20 items-center justify-center mr-2">
                    <Star size={18} color="#E6B655" />
                  </View>
                  <View>
                    <Text className="text-lg font-bold text-craftopia-textPrimary font-poppinsBold">
                      Featured Rewards
                    </Text>
                    <Text className="text-xs text-craftopia-textSecondary font-nunito">
                      Premium rewards for dedicated crafters
                    </Text>
                  </View>
                </View>
              </View>

              <View className="space-y-3">
                {featuredRewards.map((reward) => (
                  <RewardCard
                    key={reward.reward_id}
                    reward={reward}
                    userPoints={userPoints}
                    onPress={handleRewardPress}
                    isRedeeming={isRedeeming}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Regular Rewards Section */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-xl bg-craftopia-primary/20 items-center justify-center mr-2">
                  <Gift size={18} color="#3B6E4D" />
                </View>
                <View>
                  <Text className="text-lg font-bold text-craftopia-textPrimary font-poppinsBold">
                    Available Rewards
                  </Text>
                  <Text className="text-xs text-craftopia-textSecondary font-nunito">
                    {regularRewards.length} reward{regularRewards.length !== 1 ? 's' : ''} ready to redeem
                  </Text>
                </View>
              </View>
            </View>

            {/* Loading State */}
            {isLoading && (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#3B6E4D" />
                <Text className="text-sm text-craftopia-textSecondary mt-2 font-nunito">
                  Loading rewards...
                </Text>
              </View>
            )}

            {/* Error State */}
            {rewardsError && !isLoading && (
              <View className="bg-craftopia-surface rounded-xl p-6 items-center border border-craftopia-error/20">
                <View className="w-12 h-12 rounded-full bg-craftopia-error/10 items-center justify-center mb-3">
                  <AlertCircle size={24} color="#D66B4E" />
                </View>
                <Text className="text-base font-semibold text-craftopia-textPrimary mb-1 font-poppinsBold">
                  Failed to Load Rewards
                </Text>
                <Text className="text-xs text-craftopia-textSecondary text-center mb-3 font-nunito">
                  {rewardsError.message}
                </Text>
                <TouchableOpacity
                  className="bg-craftopia-primary rounded-full px-6 py-3"
                  onPress={() => refetchRewards()}
                  activeOpacity={0.7}
                >
                  <Text className="text-sm font-semibold text-white font-nunito">
                    Try Again
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Empty State */}
            {!isLoading && !rewardsError && rewards.length === 0 && (
              <View className="bg-craftopia-surface rounded-xl p-6 items-center border border-craftopia-light">
                <View className="w-12 h-12 rounded-full bg-craftopia-light items-center justify-center mb-3">
                  <Gift size={24} color="#5F6F64" />
                </View>
                <Text className="text-base font-semibold text-craftopia-textPrimary mb-1 font-poppinsBold">
                  No Rewards Available
                </Text>
                <Text className="text-xs text-craftopia-textSecondary text-center mb-4 font-nunito">
                  Check back later for exciting rewards!
                </Text>
                <TouchableOpacity
                  className="bg-craftopia-primary rounded-full px-6 py-3"
                  onPress={handleRefresh}
                  activeOpacity={0.7}
                >
                  <Text className="text-sm font-semibold text-white font-nunito">
                    Refresh
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Rewards List */}
            {!isLoading && !rewardsError && regularRewards.length > 0 && (
              <View className="space-y-3">
                {regularRewards.map((reward) => (
                  <RewardCard
                    key={reward.reward_id}
                    reward={reward}
                    userPoints={userPoints}
                    onPress={handleRewardPress}
                    isRedeeming={isRedeeming}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Info Cards */}
          {!isLoading && rewards.length > 0 && (
            <View className="space-y-3">
              {/* Points Earning Tips */}
              <View className="bg-craftopia-light rounded-xl p-4 border border-craftopia-accent/20">
                <View className="flex-row items-start">
                  <Zap size={16} color="#E6B655" className="mt-0.5 mr-2" />
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-craftopia-textPrimary mb-1 font-poppinsBold">
                      Boost Your Points
                    </Text>
                    <Text className="text-xs text-craftopia-textSecondary font-nunito">
                      Complete daily challenges (+50 pts), share your crafts (+25 pts), and participate in eco-quests (+100 pts) to earn more points!
                    </Text>
                  </View>
                </View>
              </View>

              {/* Redemption Info */}
              <View className="bg-craftopia-primary/5 rounded-xl p-4 border border-craftopia-primary/20">
                <View className="flex-row items-start">
                  <Clock size={16} color="#3B6E4D" className="mt-0.5 mr-2" />
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-craftopia-textPrimary mb-1 font-poppinsBold">
                      Redemption Process
                    </Text>
                    <Text className="text-xs text-craftopia-textSecondary font-nunito">
                      Rewards are typically fulfilled within 3-5 business days. You'll receive a notification when your reward is ready for pickup or shipment.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Bottom Padding */}
          <View className="h-20" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
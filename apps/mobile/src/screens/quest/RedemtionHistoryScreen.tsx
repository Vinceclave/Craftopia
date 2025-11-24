// apps/mobile/src/screens/RedemptionHistoryScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Redemption } from '~/services/reward.service';
import { useMyRedemptions } from '~/hooks/useRewards';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EcoQuestStackParamList } from '~/navigations/types';

export const RedemptionHistoryScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<EcoQuestStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'fulfilled' | 'cancelled'>('all');

  const {
    data: redemptionsData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useMyRedemptions(
    1,
    20,
    statusFilter === 'all' ? undefined : statusFilter
  );

  const redemptions = redemptionsData?.data || [];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'fulfilled':
        return {
          icon: CheckCircle,
          color: '#5BA776',
          bgColor: 'bg-craftopia-success/10',
          borderColor: 'border-craftopia-success/30',
          label: 'Fulfilled',
        };
      case 'pending':
        return {
          icon: Clock,
          color: '#E6B655',
          bgColor: 'bg-craftopia-accent/10',
          borderColor: 'border-craftopia-accent/30',
          label: 'Pending',
        };
      case 'cancelled':
        return {
          icon: XCircle,
          color: '#D66B4E',
          bgColor: 'bg-craftopia-error/10',
          borderColor: 'border-craftopia-error/30',
          label: 'Cancelled',
        };
      default:
        return {
          icon: Clock,
          color: '#5F6F64',
          bgColor: 'bg-craftopia-light',
          borderColor: 'border-craftopia-light',
          label: 'Unknown',
        };
    }
  };

  const RedemptionCard = ({ redemption }: { redemption: Redemption }) => {
    const statusConfig = getStatusConfig(redemption.status);
    const StatusIcon = statusConfig.icon;

    return (
      <View 
        className={`bg-craftopia-surface rounded-xl p-3 mb-2 border ${statusConfig.borderColor}`}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-2">
          <View className={`flex-row items-center px-2 py-1 rounded-lg ${statusConfig.bgColor}`}>
            <StatusIcon size={14} color={statusConfig.color} />
            <Text 
              className="text-xs font-semibold uppercase tracking-wide ml-1 font-nunito"
              style={{ color: statusConfig.color }}
            >
              {statusConfig.label}
            </Text>
          </View>

          <Text className="text-xs text-craftopia-textSecondary font-nunito">
            ID: #{redemption.redemption_id}
          </Text>
        </View>

        {/* Reward Info */}
        <Text className="text-sm font-semibold text-craftopia-textPrimary mb-1 font-poppinsBold">
          {redemption.reward.title}
        </Text>
        
        <Text className="text-xs text-craftopia-textSecondary mb-2 font-nunito">
          {redemption.reward.sponsor.name}
        </Text>

        {redemption.reward.description && (
          <Text className="text-xs text-craftopia-textSecondary mb-3 font-nunito" numberOfLines={2}>
            {redemption.reward.description}
          </Text>
        )}

        {/* Footer */}
        <View className="flex-row items-center justify-between pt-2 border-t border-craftopia-light">
          <View className="flex-row items-center">
            <Calendar size={12} color="#5F6F64" />
            <Text className="text-xs text-craftopia-textSecondary ml-1 font-nunito">
              {new Date(redemption.claimed_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>

          <View className="flex-row items-center bg-craftopia-primary/10 px-2 py-1 rounded-lg">
            <Package size={12} color="#3B6E4D" />
            <Text className="text-xs font-bold text-craftopia-primary ml-1 font-poppinsBold">
              {redemption.reward.points_cost} pts
            </Text>
          </View>
        </View>

        {/* Fulfillment Date */}
        {redemption.fulfilled_at && (
          <View className="mt-2 pt-2 border-t border-craftopia-light">
            <View className="flex-row items-center">
              <CheckCircle size={12} color="#5BA776" />
              <Text className="text-xs text-craftopia-success ml-1 font-nunito">
                Fulfilled on {new Date(redemption.fulfilled_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-background">
      {/* Header */}
      <View className="px-4 pt-4 pb-3 bg-craftopia-surface border-b border-craftopia-light">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-9 h-9 rounded-full bg-craftopia-light items-center justify-center mr-3"
          >
            <ArrowLeft size={18} color="#3B6E4D" />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="text-xs text-craftopia-textSecondary uppercase tracking-wider mb-0.5 font-nunito">
              Your Rewards
            </Text>
            <Text className="text-xl font-bold text-craftopia-textPrimary font-poppinsBold">
              Redemption History
            </Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'fulfilled', label: 'Fulfilled' },
            { key: 'cancelled', label: 'Cancelled' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setStatusFilter(filter.key as any)}
              className={`px-4 py-2 rounded-full border ${
                statusFilter === filter.key
                  ? 'bg-craftopia-primary border-craftopia-primary'
                  : 'bg-craftopia-surface border-craftopia-light'
              }`}
            >
              <Text
                className={`text-sm font-semibold font-nunito ${
                  statusFilter === filter.key
                    ? 'text-white'
                    : 'text-craftopia-textSecondary'
                }`}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
          {/* Loading State */}
          {isLoading && !isRefetching && (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#3B6E4D" />
              <Text className="text-sm text-craftopia-textSecondary mt-2 font-nunito">
                Loading redemptions...
              </Text>
            </View>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <View className="bg-craftopia-surface rounded-xl p-6 items-center border border-craftopia-error/20">
              <View className="w-12 h-12 rounded-full bg-craftopia-error/10 items-center justify-center mb-3">
                <AlertCircle size={24} color="#D66B4E" />
              </View>
              <Text className="text-base font-semibold text-craftopia-textPrimary mb-1 font-poppinsBold">
                Failed to Load History
              </Text>
              <Text className="text-xs text-craftopia-textSecondary text-center mb-3 font-nunito">
                {error.message}
              </Text>
              <TouchableOpacity
                className="bg-craftopia-primary rounded-full px-6 py-3"
                onPress={() => refetch()}
                activeOpacity={0.7}
              >
                <Text className="text-sm font-semibold text-white font-nunito">
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Empty State */}
          {!isLoading && !error && redemptions.length === 0 && (
            <View className="bg-craftopia-surface rounded-xl p-6 items-center border border-craftopia-light">
              <View className="w-12 h-12 rounded-full bg-craftopia-light items-center justify-center mb-3">
                <Package size={24} color="#5F6F64" />
              </View>
              <Text className="text-base font-semibold text-craftopia-textPrimary mb-1 font-poppinsBold">
                No Redemptions Yet
              </Text>
              <Text className="text-xs text-craftopia-textSecondary text-center font-nunito">
                {statusFilter === 'all'
                  ? 'Start claiming rewards to see your history here'
                  : `No ${statusFilter} redemptions found`}
              </Text>
            </View>
          )}

          {/* Redemptions List */}
          {!isLoading && !error && redemptions.length > 0 && (
            <View>
              <View className="mb-3">
                <Text className="text-xs text-craftopia-textSecondary font-nunito">
                  {redemptions.length} redemption{redemptions.length !== 1 ? 's' : ''} found
                </Text>
              </View>

              {redemptions.map((redemption) => (
                <RedemptionCard key={redemption.redemption_id} redemption={redemption} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
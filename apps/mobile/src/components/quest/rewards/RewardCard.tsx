// apps/mobile/src/components/rewards/RewardCard.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Gift,
  Award,
  Calendar,
  Package,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';
import { Reward } from '~/services/reward.service';
import { RewardClaimModal } from './RewardClaimModal';
import { useRedeemReward } from '~/hooks/useRewards';

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  onPress?: (reward: Reward) => void;
  isRedeeming?: boolean; 
}
export const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  userPoints,
  onPress,
  isRedeeming
}) => {
  const [claimModalVisible, setClaimModalVisible] = useState(false);
  const redeemMutation = useRedeemReward();

    const canAfford = userPoints >= reward.points_cost;
  const isAvailable = reward.is_active && 
    (!reward.quantity || reward.redeemed_count < reward.quantity) &&
    (!reward.expires_at || new Date(reward.expires_at) > new Date());
  
  const disabled = !canAfford || !isAvailable || isRedeeming;
  const remainingQuantity = reward.quantity 
    ? reward.quantity - reward.redeemed_count 
    : null;

  const handleClaimPress = (e: any) => {
    e.stopPropagation();
    setClaimModalVisible(true);
  };

  const handleConfirmClaim = async () => {
    try {
      await redeemMutation.mutateAsync(reward.reward_id);
      setClaimModalVisible(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const getStatusBadge = () => {
    if (!reward.is_active) {
      return (
        <View className="flex-row items-center bg-craftopia-error/10 px-2 py-1 rounded-lg">
          <AlertCircle size={12} color="#D66B4E" />
          <Text className="text-xs font-medium text-craftopia-error ml-1 font-nunito">
            Inactive
          </Text>
        </View>
      );
    }
    
    if (reward.quantity && reward.redeemed_count >= reward.quantity) {
      return (
        <View className="flex-row items-center bg-craftopia-warning/10 px-2 py-1 rounded-lg">
          <AlertCircle size={12} color="#E3A84F" />
          <Text className="text-xs font-medium text-craftopia-warning ml-1 font-nunito">
            Out of Stock
          </Text>
        </View>
      );
    }

    if (reward.expires_at && new Date(reward.expires_at) < new Date()) {
      return (
        <View className="flex-row items-center bg-craftopia-error/10 px-2 py-1 rounded-lg">
          <AlertCircle size={12} color="#D66B4E" />
          <Text className="text-xs font-medium text-craftopia-error ml-1 font-nunito">
            Expired
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-row items-center bg-craftopia-success/10 px-2 py-1 rounded-lg">
        <CheckCircle size={12} color="#5BA776" />
        <Text className="text-xs font-medium text-craftopia-success ml-1 font-nunito">
          Available
        </Text>
      </View>
    );
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => onPress?.(reward)}
        activeOpacity={0.7}
        className="bg-craftopia-surface rounded-xl p-3 mb-2 border border-craftopia-light"
      >
        {/* Header Row */}
        <View className="flex-row items-start justify-between mb-2">
          {/* Sponsor Logo */}
          <View className="flex-row items-center flex-1">
            {reward.sponsor.logo_url ? (
              <Image
                source={{ uri: reward.sponsor.logo_url }}
                className="w-10 h-10 rounded-lg mr-3"
                resizeMode="contain"
              />
            ) : (
              <View className="w-10 h-10 rounded-lg bg-craftopia-accent/10 items-center justify-center mr-3">
                <Gift size={20} color="#E6B655" />
              </View>
            )}
            
            <View className="flex-1">
              <Text className="text-xs text-craftopia-textSecondary font-nunito">
                {reward.sponsor.name}
              </Text>
              <Text 
                className="text-sm font-semibold text-craftopia-textPrimary font-poppinsBold"
                numberOfLines={2}
              >
                {reward.title}
              </Text>
            </View>
          </View>

          {/* Status Badge */}
          {getStatusBadge()}
        </View>

        {/* Description */}
        {reward.description && (
          <Text 
            className="text-xs text-craftopia-textSecondary mb-3 font-nunito"
            numberOfLines={2}
          >
            {reward.description}
          </Text>
        )}

        {/* Info Row */}
        <View className="flex-row items-center justify-between mb-3">
          {/* Points Cost */}
          <View className="flex-row items-center bg-craftopia-primary/10 px-3 py-1.5 rounded-lg">
            <Award size={14} color="#3B6E4D" />
            <Text className="text-sm font-bold text-craftopia-primary ml-1.5 font-poppinsBold">
              {reward.points_cost}
            </Text>
            <Text className="text-xs text-craftopia-textSecondary ml-0.5 font-nunito">
              pts
            </Text>
          </View>

          {/* Additional Info */}
          <View className="flex-row items-center gap-2">
            {/* Remaining Quantity */}
            {remainingQuantity !== null && (
              <View className="flex-row items-center bg-craftopia-light px-2 py-1 rounded-lg">
                <Package size={12} color="#5F6F64" />
                <Text className="text-xs text-craftopia-textSecondary ml-1 font-nunito">
                  {remainingQuantity}
                </Text>
              </View>
            )}

            {/* Expiry Date */}
            {reward.expires_at && (
              <View className="flex-row items-center bg-craftopia-light px-2 py-1 rounded-lg">
                <Calendar size={12} color="#5F6F64" />
                <Text className="text-xs text-craftopia-textSecondary ml-1 font-nunito">
                  {new Date(reward.expires_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer with Action Button */}
        <View className="flex-row items-center justify-between pt-2 border-t border-craftopia-light">
          {/* Points Status */}
          <View className="flex-row items-center">
            {canAfford ? (
              <>
                <CheckCircle size={14} color="#5BA776" />
                <Text className="text-xs text-craftopia-success ml-1 font-nunito">
                  You can afford this
                </Text>
              </>
            ) : (
              <>
                <AlertCircle size={14} color="#D66B4E" />
                <Text className="text-xs text-craftopia-error ml-1 font-nunito">
                  Need {reward.points_cost - userPoints} more pts
                </Text>
              </>
            )}
          </View>

          {/* Claim Button */}
          <TouchableOpacity
              onPress={handleClaimPress}
              disabled={!canAfford || !isAvailable || isRedeeming} // use it directly here
              activeOpacity={0.7}
              className={`flex-row items-center px-3 py-1.5 rounded-lg ${
                canAfford && isAvailable && !isRedeeming
                  ? 'bg-craftopia-primary'
                  : 'bg-craftopia-light'
              }`}
            >
              <Text 
                className={`text-xs font-semibold mr-1 font-nunito ${
                  canAfford && isAvailable && !isRedeeming
                    ? 'text-white'
                    : 'text-craftopia-textSecondary'
                }`}
              >
                {canAfford && isAvailable && !isRedeeming ? 'Claim' : 'View'}
              </Text>
              <ChevronRight 
                size={14} 
                color={canAfford && isAvailable && !isRedeeming ? '#FFFFFF' : '#5F6F64'} 
              />
            </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Claim Modal */}
      <RewardClaimModal
        visible={claimModalVisible}
        onClose={() => setClaimModalVisible(false)}
        onConfirm={handleConfirmClaim}
        reward={reward}
        userPoints={userPoints}
        loading={redeemMutation.isPending}
      />
    </>
  );
};
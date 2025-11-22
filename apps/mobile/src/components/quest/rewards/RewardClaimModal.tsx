// apps/mobile/src/components/rewards/RewardClaimModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { 
  X, 
  Gift, 
  Award,
  CheckCircle,
  AlertCircle,
  Calendar,
  Package
} from 'lucide-react-native';
import Button from '~/components/common/Button';
import { Reward } from '~/services/reward.service';

interface RewardClaimModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reward: Reward | null;
  userPoints: number;
  loading?: boolean;
}

export const RewardClaimModal: React.FC<RewardClaimModalProps> = ({
  visible,
  onClose,
  onConfirm,
  reward,
  userPoints,
  loading = false,
}) => {
  if (!reward) return null;

  const canAfford = userPoints >= reward.points_cost;
  const isAvailable = reward.is_active && 
    (!reward.quantity || reward.redeemed_count < reward.quantity) &&
    (!reward.expires_at || new Date(reward.expires_at) > new Date());

  const getAvailabilityStatus = () => {
    if (!reward.is_active) {
      return { icon: AlertCircle, color: '#D66B4E', text: 'Inactive' };
    }
    if (reward.quantity && reward.redeemed_count >= reward.quantity) {
      return { icon: AlertCircle, color: '#D66B4E', text: 'Out of Stock' };
    }
    if (reward.expires_at && new Date(reward.expires_at) < new Date()) {
      return { icon: AlertCircle, color: '#D66B4E', text: 'Expired' };
    }
    return { icon: CheckCircle, color: '#5BA776', text: 'Available' };
  };

  const availabilityStatus = getAvailabilityStatus();
  const AvailabilityIcon = availabilityStatus.icon;

  const remainingQuantity = reward.quantity 
    ? reward.quantity - reward.redeemed_count 
    : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-craftopia-surface rounded-t-2xl max-h-[90%]">
          {/* Handle Bar */}
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 bg-craftopia-light rounded-full" />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="px-4 pb-6">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-craftopia-accent/20 rounded-full items-center justify-center mr-3">
                    <Gift size={20} color="#E6B655" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-craftopia-textPrimary font-poppinsBold">
                      Claim Reward
                    </Text>
                    <Text className="text-xs text-craftopia-textSecondary font-nunito">
                      Review details before claiming
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  onPress={onClose}
                  className="w-8 h-8 bg-craftopia-light rounded-full items-center justify-center"
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <X size={18} color="#5F6F64" />
                </TouchableOpacity>
              </View>

              {/* Sponsor Logo (if available) */}
              {reward.sponsor.logo_url && (
                <View className="items-center mb-4">
                  <Image
                    source={{ uri: reward.sponsor.logo_url }}
                    className="w-20 h-20 rounded-xl"
                    resizeMode="contain"
                  />
                  <Text className="text-sm font-semibold text-craftopia-textPrimary mt-2 font-poppinsBold">
                    {reward.sponsor.name}
                  </Text>
                </View>
              )}

              {/* Reward Details Card */}
              <View className="bg-craftopia-light rounded-xl p-4 mb-4">
                <Text className="text-lg font-bold text-craftopia-textPrimary mb-2 font-poppinsBold">
                  {reward.title}
                </Text>
                
                {reward.description && (
                  <Text className="text-sm text-craftopia-textSecondary leading-relaxed mb-3 font-nunito">
                    {reward.description}
                  </Text>
                )}

                {/* Points Cost */}
                <View className="flex-row items-center justify-between p-3 bg-craftopia-surface rounded-lg mb-2">
                  <View className="flex-row items-center">
                    <Award size={18} color="#3B6E4D" />
                    <Text className="text-sm font-semibold text-craftopia-textPrimary ml-2 font-poppinsBold">
                      Cost
                    </Text>
                  </View>
                  <Text className="text-lg font-bold text-craftopia-primary font-poppinsBold">
                    {reward.points_cost} pts
                  </Text>
                </View>

                {/* Availability Status */}
                <View className="flex-row items-center justify-between p-3 bg-craftopia-surface rounded-lg mb-2">
                  <View className="flex-row items-center">
                    <AvailabilityIcon size={18} color={availabilityStatus.color} />
                    <Text className="text-sm font-semibold text-craftopia-textPrimary ml-2 font-poppinsBold">
                      Status
                    </Text>
                  </View>
                  <Text 
                    className="text-sm font-bold font-poppinsBold"
                    style={{ color: availabilityStatus.color }}
                  >
                    {availabilityStatus.text}
                  </Text>
                </View>

                {/* Quantity Info */}
                {remainingQuantity !== null && (
                  <View className="flex-row items-center justify-between p-3 bg-craftopia-surface rounded-lg mb-2">
                    <View className="flex-row items-center">
                      <Package size={18} color="#5F6F64" />
                      <Text className="text-sm font-semibold text-craftopia-textPrimary ml-2 font-poppinsBold">
                        Remaining
                      </Text>
                    </View>
                    <Text className="text-sm font-bold text-craftopia-textSecondary font-poppinsBold">
                      {remainingQuantity} left
                    </Text>
                  </View>
                )}

                {/* Expiry Date */}
                {reward.expires_at && (
                  <View className="flex-row items-center justify-between p-3 bg-craftopia-surface rounded-lg">
                    <View className="flex-row items-center">
                      <Calendar size={18} color="#5F6F64" />
                      <Text className="text-sm font-semibold text-craftopia-textPrimary ml-2 font-poppinsBold">
                        Expires
                      </Text>
                    </View>
                    <Text className="text-sm font-bold text-craftopia-textSecondary font-poppinsBold">
                      {new Date(reward.expires_at).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>

              {/* Your Balance */}
              <View className="bg-craftopia-primary/10 border border-craftopia-primary/20 rounded-xl p-4 mb-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-craftopia-textPrimary font-poppinsBold">
                    Your Current Balance
                  </Text>
                  <Text className="text-lg font-bold text-craftopia-primary font-poppinsBold">
                    {userPoints} pts
                  </Text>
                </View>
                
                {canAfford && (
                  <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-craftopia-primary/20">
                    <Text className="text-sm text-craftopia-textSecondary font-nunito">
                      Balance After Claim
                    </Text>
                    <Text className="text-base font-bold text-craftopia-success font-poppinsBold">
                      {userPoints - reward.points_cost} pts
                    </Text>
                  </View>
                )}
              </View>

              {/* Warning Messages */}
              {!canAfford && (
                <View className="bg-craftopia-error/10 border border-craftopia-error/20 rounded-xl p-3 mb-4">
                  <View className="flex-row items-center">
                    <AlertCircle size={16} color="#D66B4E" />
                    <Text className="text-sm text-craftopia-error font-semibold ml-2 flex-1 font-poppinsBold">
                      Insufficient Points
                    </Text>
                  </View>
                  <Text className="text-xs text-craftopia-textSecondary mt-1 font-nunito">
                    You need {reward.points_cost - userPoints} more points to claim this reward
                  </Text>
                </View>
              )}

              {!isAvailable && canAfford && (
                <View className="bg-craftopia-warning/10 border border-craftopia-warning/20 rounded-xl p-3 mb-4">
                  <View className="flex-row items-center">
                    <AlertCircle size={16} color="#E3A84F" />
                    <Text className="text-sm text-craftopia-warning font-semibold ml-2 flex-1 font-poppinsBold">
                      Reward Not Available
                    </Text>
                  </View>
                  <Text className="text-xs text-craftopia-textSecondary mt-1 font-nunito">
                    This reward is currently unavailable for redemption
                  </Text>
                </View>
              )}

              {/* Info Message */}
              {canAfford && isAvailable && (
                <View className="bg-craftopia-light rounded-xl p-3 mb-4">
                  <Text className="text-sm text-craftopia-textSecondary leading-relaxed font-nunito">
                    💡 After claiming, your reward will be marked as pending. An admin will verify and fulfill your redemption.
                  </Text>
                </View>
              )}

              {/* Actions */}
              <View className="flex-row gap-3">
                <Button
                  title="Cancel"
                  onPress={onClose}
                  size="lg"
                  variant="outline"
                  className="flex-1 border-craftopia-light"
                  textClassName="text-craftopia-textSecondary"
                  disabled={loading}
                />
                <Button
                  title={loading ? "Claiming..." : "Claim Reward"}
                  onPress={onConfirm}
                  size="lg"
                  className="flex-1"
                  loading={loading}
                  disabled={loading || !canAfford || !isAvailable}
                  leftIcon={!loading ? <Gift size={16} color="#fff" /> : undefined}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
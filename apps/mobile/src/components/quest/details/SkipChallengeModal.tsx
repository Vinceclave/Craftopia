import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Package, 
  Clock, 
  Frown,
  Zap 
} from 'lucide-react-native';
import Button from '~/components/common/Button';

interface SkipChallengeModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  loading?: boolean;
}

const SKIP_REASONS = [
  { 
    value: 'no_materials', 
    label: "Don't have materials", 
    icon: Package 
  },
  { 
    value: 'too_busy', 
    label: 'Too busy right now', 
    icon: Clock 
  },
  { 
    value: 'not_interested', 
    label: 'Not interested anymore', 
    icon: Frown 
  },
  { 
    value: 'too_difficult', 
    label: 'Too difficult', 
    icon: Zap 
  },
];

export const SkipChallengeModal: React.FC<SkipChallengeModalProps> = ({
  visible,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState('');

  const handleConfirm = () => {
    const reason = selectedReason === 'other' 
      ? customReason 
      : SKIP_REASONS.find(r => r.value === selectedReason)?.label;
    
    onConfirm(reason);
  };

  const handleClose = () => {
    setSelectedReason(null);
    setCustomReason('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
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
                  <View className="w-10 h-10 bg-craftopia-warning/20 rounded-full items-center justify-center mr-3">
                    <AlertTriangle size={20} color="#E3A84F" />
                  </View>
                  <View>
                    <Text className="text-lg font-bold text-craftopia-textPrimary font-poppinsBold">
                      Skip Challenge
                    </Text>
                    <Text className="text-xs text-craftopia-textSecondary font-nunito">
                      No penalty, try another anytime
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  onPress={handleClose}
                  className="w-8 h-8 bg-craftopia-light rounded-full items-center justify-center"
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <X size={18} color="#5F6F64" />
                </TouchableOpacity>
              </View>

              {/* Info Banner */}
              <View className="bg-craftopia-light p-3 rounded-xl mb-4">
                <Text className="text-sm text-craftopia-textSecondary leading-relaxed font-nunito">
                  You can skip this challenge and explore others. Your points stay safe! 🌱
                </Text>
              </View>

              {/* Reason Selection */}
              <Text className="text-sm font-semibold text-craftopia-textPrimary mb-3 font-poppinsBold">
                Why are you skipping? (Optional)
              </Text>

              <View className="gap-2 mb-4">
                {SKIP_REASONS.map((reason) => {
                  const isSelected = selectedReason === reason.value;
                  const IconComponent = reason.icon;
                  
                  return (
                    <TouchableOpacity
                      key={reason.value}
                      onPress={() => setSelectedReason(reason.value)}
                      disabled={loading}
                      activeOpacity={0.7}
                      className={`p-3 rounded-xl border flex-row items-center ${
                        isSelected
                          ? 'bg-craftopia-primary/10 border-craftopia-primary'
                          : 'bg-craftopia-surface border-craftopia-light'
                      }`}
                      style={{
                        shadowColor: isSelected ? '#3B6E4D' : 'transparent',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: isSelected ? 0.1 : 0,
                        shadowRadius: 2,
                        elevation: isSelected ? 1 : 0,
                      }}
                    >
                      <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                        isSelected ? 'bg-craftopia-primary/20' : 'bg-craftopia-light'
                      }`}>
                        <IconComponent 
                          size={16} 
                          color={isSelected ? '#3B6E4D' : '#5F6F64'} 
                        />
                      </View>
                      
                      <Text
                        className={`flex-1 text-sm font-medium font-nunito ${
                          isSelected
                            ? 'text-craftopia-primary'
                            : 'text-craftopia-textSecondary'
                        }`}
                      >
                        {reason.label}
                      </Text>
                      
                      {isSelected && (
                        <CheckCircle size={18} color="#3B6E4D" />
                      )}
                    </TouchableOpacity>
                  );
                })}

                {/* Other Reason Option */}
                <TouchableOpacity
                  onPress={() => setSelectedReason('other')}
                  disabled={loading}
                  activeOpacity={0.7}
                  className={`p-3 rounded-xl border flex-row items-center ${
                    selectedReason === 'other'
                      ? 'bg-craftopia-primary/10 border-craftopia-primary'
                      : 'bg-craftopia-surface border-craftopia-light'
                  }`}
                  style={{
                    shadowColor: selectedReason === 'other' ? '#3B6E4D' : 'transparent',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: selectedReason === 'other' ? 0.1 : 0,
                    shadowRadius: 2,
                    elevation: selectedReason === 'other' ? 1 : 0,
                  }}
                >
                  <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                    selectedReason === 'other' ? 'bg-craftopia-primary/20' : 'bg-craftopia-light'
                  }`}>
                    <Text className={`text-base ${
                      selectedReason === 'other' ? 'text-craftopia-primary' : 'text-craftopia-textSecondary'
                    }`}>
                      💭
                    </Text>
                  </View>
                  
                  <Text
                    className={`flex-1 text-sm font-medium font-nunito ${
                      selectedReason === 'other'
                        ? 'text-craftopia-primary'
                        : 'text-craftopia-textSecondary'
                    }`}
                  >
                    Other reason
                  </Text>
                  
                  {selectedReason === 'other' && (
                    <CheckCircle size={18} color="#3B6E4D" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Custom Reason Input */}
              {selectedReason === 'other' && (
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-craftopia-textPrimary mb-2 font-poppinsBold">
                    Tell us more (optional)
                  </Text>
                  <View className="bg-craftopia-light border border-craftopia-light rounded-xl overflow-hidden">
                    <TextInput
                      value={customReason}
                      onChangeText={setCustomReason}
                      placeholder="Share your thoughts..."
                      placeholderTextColor="#9ca3af"
                      multiline
                      numberOfLines={4}
                      maxLength={200}
                      className="p-3 text-craftopia-textPrimary text-sm font-nunito"
                      style={{ textAlignVertical: 'top', minHeight: 100 }}
                      editable={!loading}
                    />
                  </View>
                  <Text className="text-xs text-craftopia-textSecondary mt-1.5 text-right font-nunito">
                    {customReason.length}/200
                  </Text>
                </View>
              )}

              {/* Actions */}
              <View className="flex-row gap-3 mt-2">
                <Button
                  title="Cancel"
                  onPress={handleClose}
                  size="lg"
                  variant="outline"
                  className="flex-1 border-craftopia-light"
                  textClassName="text-craftopia-textSecondary"
                  disabled={loading}
                />
                <Button
                  title={loading ? "Skipping..." : "Skip Challenge"}
                  onPress={handleConfirm}
                  size="lg"
                  className="flex-1"
                  loading={loading}
                  disabled={loading}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
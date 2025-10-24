// apps/mobile/src/components/quest/details/SkipChallengeModal.tsx - NEW
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { X, AlertTriangle } from 'lucide-react-native';
import Button from '~/components/common/Button';

interface SkipChallengeModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  loading?: boolean;
}

const SKIP_REASONS = [
  { value: 'no_materials', label: "Don't have materials" },
  { value: 'too_busy', label: 'Too busy right now' },
  { value: 'not_interested', label: 'Not interested anymore' },
  { value: 'too_difficult', label: 'Too difficult' },
  { value: 'other', label: 'Other reason' },
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
        <View className="bg-craftopia-surface rounded-t-xl p-4 max-h-[80%]">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <View className="p-2 bg-yellow-100 rounded-full mr-3">
                <AlertTriangle size={20} color="#f59e0b" />
              </View>
              <Text className="text-lg font-semibold text-craftopia-textPrimary">
                Skip Challenge?
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              className="p-2"
              disabled={loading}
            >
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text className="text-sm text-craftopia-textSecondary mb-4">
            You can skip this challenge and try another one. This won't affect your points.
          </Text>

          {/* Reason Selection */}
          <Text className="text-sm font-medium text-craftopia-textPrimary mb-2">
            Why are you skipping? (Optional)
          </Text>

          <View className="space-y-2 mb-4">
            {SKIP_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason.value}
                onPress={() => setSelectedReason(reason.value)}
                disabled={loading}
                className={`p-3 rounded-lg border ${
                  selectedReason === reason.value
                    ? 'bg-craftopia-primary/10 border-craftopia-primary'
                    : 'bg-craftopia-light border-craftopia-light'
                }`}
              >
                <Text
                  className={`text-sm ${
                    selectedReason === reason.value
                      ? 'text-craftopia-primary font-medium'
                      : 'text-craftopia-textSecondary'
                  }`}
                >
                  {reason.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Reason Input */}
          {selectedReason === 'other' && (
            <View className="mb-4">
              <TextInput
                value={customReason}
                onChangeText={setCustomReason}
                placeholder="Tell us more (optional)"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                maxLength={200}
                className="bg-craftopia-light border border-craftopia-light rounded-lg p-3 text-craftopia-textPrimary text-sm"
                style={{ textAlignVertical: 'top' }}
                editable={!loading}
              />
              <Text className="text-xs text-craftopia-textSecondary mt-1 text-right">
                {customReason.length}/200
              </Text>
            </View>
          )}

          {/* Actions */}
          <View className="flex-row gap-3">
            <Button
              title="Cancel"
              onPress={handleClose}
              size="md"
              className="flex-1 bg-craftopia-light"
              textClassName="text-craftopia-textSecondary"
              disabled={loading}
            />
            <Button
              title={loading ? "Skipping..." : "Skip Challenge"}
              onPress={handleConfirm}
              size="md"
              className="flex-1"
              loading={loading}
              disabled={loading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};
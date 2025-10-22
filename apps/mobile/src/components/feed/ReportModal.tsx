// apps/mobile/src/components/feed/ReportModal.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { X, Flag, AlertTriangle } from 'lucide-react-native';
import Button from '~/components/common/Button';

export type ReportReason = 
  | 'spam'
  | 'harassment'
  | 'inappropriate'
  | 'misinformation'
  | 'violence'
  | 'copyright'
  | 'other';

interface ReportOption {
  id: ReportReason;
  label: string;
  description: string;
  icon: string;
}

const REPORT_OPTIONS: ReportOption[] = [
  {
    id: 'spam',
    label: 'Spam',
    description: 'Repetitive or promotional content',
    icon: '🚫'
  },
  {
    id: 'harassment',
    label: 'Harassment or Bullying',
    description: 'Targeting individuals with harmful content',
    icon: '⚠️'
  },
  {
    id: 'inappropriate',
    label: 'Inappropriate Content',
    description: 'Adult content or graphic material',
    icon: '🔞'
  },
  {
    id: 'misinformation',
    label: 'False Information',
    description: 'Spreading misinformation or fake news',
    icon: '❌'
  },
  {
    id: 'violence',
    label: 'Violence or Dangerous Content',
    description: 'Content promoting violence or harm',
    icon: '⚔️'
  },
  {
    id: 'copyright',
    label: 'Copyright Violation',
    description: 'Unauthorized use of copyrighted material',
    icon: '©️'
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Another reason not listed above',
    icon: '💬'
  }
];

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, details: string) => void;
  contentType: 'post' | 'comment';
  contentId: number;
  loading?: boolean;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  onSubmit,
  contentType,
  contentId,
  loading = false
}) => {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [step, setStep] = useState<'select' | 'details'>('select');

  const handleReasonSelect = (reason: ReportReason) => {
    setSelectedReason(reason);
    setStep('details');
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('select');
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedReason(null);
    setDetails('');
    setStep('select');
    onClose();
  };

  const handleSubmit = () => {
    if (selectedReason) {
      onSubmit(selectedReason, details.trim());
      handleClose();
    }
  };

  const canSubmit = selectedReason && (selectedReason !== 'other' || details.trim().length > 0);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-craftopia-surface rounded-t-xl max-h-[80%]">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-craftopia-light">
            <TouchableOpacity
              onPress={handleBack}
              className="w-8 h-8 items-center justify-center"
              activeOpacity={0.7}
            >
              <X size={20} color="#1A1A1A" />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <Flag size={18} color="#EF4444" />
              <Text className="text-base font-semibold text-craftopia-textPrimary ml-2">
                Report {contentType}
              </Text>
            </View>
            <View className="w-8" />
          </View>

          {/* Content */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {step === 'select' ? (
              /* Step 1: Select Reason */
              <View className="p-4">
                <View className="bg-craftopia-light/50 p-3 rounded-lg mb-4 flex-row">
                  <AlertTriangle size={20} color="#F59E0B" />
                  <Text className="text-sm text-craftopia-textSecondary ml-2 flex-1">
                    Help us understand what's wrong with this {contentType}
                  </Text>
                </View>

                {REPORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => handleReasonSelect(option.id)}
                    className="bg-craftopia-light p-4 rounded-lg mb-2 flex-row items-center"
                    activeOpacity={0.7}
                  >
                    <Text className="text-2xl mr-3">{option.icon}</Text>
                    <View className="flex-1">
                      <Text className="text-base font-medium text-craftopia-textPrimary mb-0.5">
                        {option.label}
                      </Text>
                      <Text className="text-xs text-craftopia-textSecondary">
                        {option.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              /* Step 2: Add Details */
              <View className="p-4">
                {/* Selected Reason */}
                <View className="bg-craftopia-primary/10 p-3 rounded-lg mb-4">
                  <Text className="text-sm text-craftopia-textSecondary mb-1">
                    Reporting for:
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-xl mr-2">
                      {REPORT_OPTIONS.find(o => o.id === selectedReason)?.icon}
                    </Text>
                    <Text className="text-base font-medium text-craftopia-primary">
                      {REPORT_OPTIONS.find(o => o.id === selectedReason)?.label}
                    </Text>
                  </View>
                </View>

                {/* Details Input */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-craftopia-textPrimary mb-2">
                    Additional details {selectedReason === 'other' ? '(Required)' : '(Optional)'}
                  </Text>
                  <TextInput
                    value={details}
                    onChangeText={setDetails}
                    placeholder="Please provide more information..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    className="bg-craftopia-light border border-craftopia-light rounded-lg p-3 text-craftopia-textPrimary"
                    style={{ minHeight: 100 }}
                  />
                  <Text className="text-xs text-craftopia-textSecondary mt-1">
                    {details.length}/500 characters
                  </Text>
                </View>

                {/* Info Box */}
                <View className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
                  <Text className="text-sm text-blue-800">
                    ℹ️ Your report will be reviewed by our moderation team. We'll take appropriate action if this violates our community guidelines.
                  </Text>
                </View>

                {/* Submit Button */}
                <Button
                  title={loading ? 'Submitting...' : 'Submit Report'}
                  onPress={handleSubmit}
                  disabled={!canSubmit || loading}
                  loading={loading}
                  size="md"
                />
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
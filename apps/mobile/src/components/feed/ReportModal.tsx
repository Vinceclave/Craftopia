// apps/mobile/src/components/feed/ReportModal.tsx - CRAFTOPIA REDESIGN
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { X, Flag, AlertTriangle, CheckCircle } from 'lucide-react-native';
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
    label: 'Harassment',
    description: 'Targeting individuals with harmful content',
    icon: '⚠️'
  },
  {
    id: 'inappropriate',
    label: 'Inappropriate',
    description: 'Adult content or graphic material',
    icon: '🔞'
  },
  {
    id: 'misinformation',
    label: 'False Information',
    description: 'Spreading misinformation',
    icon: '❌'
  },
  {
    id: 'violence',
    label: 'Violence',
    description: 'Content promoting violence or harm',
    icon: '⚔️'
  },
  {
    id: 'copyright',
    label: 'Copyright',
    description: 'Unauthorized use of material',
    icon: '©️'
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Another reason not listed',
    icon: '💬'
  }
];

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, details: string) => Promise<void> | void;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedReason(null);
      setDetails('');
      setStep('select');
      setError(null);
      setIsSubmitting(false);
    }
  }, [visible]);

  const handleReasonSelect = (reason: ReportReason) => {
    setSelectedReason(reason);
    setError(null);
    setStep('details');
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('select');
      setError(null);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      setError('Please select a reason');
      return;
    }

    if (selectedReason === 'other' && !details.trim()) {
      setError('Please provide details for your report');
      return;
    }

    if (details.length > 500) {
      setError('Details cannot exceed 500 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(selectedReason, details.trim());
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
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
        <View className="bg-white rounded-t-3xl max-h-[85%] shadow-xl">
          {/* Header */}
          <View className="flex-row items-center justify-between p-5 border-b border-craftopa-light/10">
            <TouchableOpacity
              onPress={handleBack}
              className="w-9 h-9 items-center justify-center rounded-xl bg-craftopa-light/5 active:opacity-70 border border-craftopa-light/10"
              activeOpacity={0.7}
              disabled={isSubmitting}
            >
              <X size={18} color="#5A7160" />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <Flag size={18} color="#EF4444" />
              <Text className="text-lg font-poppinsBold text-craftopa-textPrimary ml-2 tracking-tight">
                Report {contentType}
              </Text>
            </View>
            <View className="w-9" />
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-red-50 border border-red-200 mx-5 mt-4 p-3 rounded-xl flex-row items-center">
              <AlertTriangle size={16} color="#EF4444" />
              <Text className="text-sm text-red-800 ml-2 flex-1 font-nunito tracking-wide">{error}</Text>
            </View>
          )}

          {/* Content */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {step === 'select' ? (
              /* Step 1: Select Reason */
              <View className="p-5">
                <View className="bg-craftopa-primary/5 p-4 rounded-2xl mb-4 flex-row border border-craftopa-primary/10">
                  <AlertTriangle size={20} color="#5A7160" />
                  <Text className="text-sm text-craftopa-textSecondary ml-3 flex-1 font-nunito tracking-wide">
                    Help us understand what's wrong with this {contentType}
                  </Text>
                </View>

                {REPORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => handleReasonSelect(option.id)}
                    className="bg-white p-4 rounded-2xl mb-2 flex-row items-center border border-craftopa-light/10 shadow-sm active:opacity-70"
                    activeOpacity={0.7}
                  >
                    <Text className="text-2xl mr-3">{option.icon}</Text>
                    <View className="flex-1">
                      <Text className="text-base font-poppinsBold text-craftopa-textPrimary mb-0.5 tracking-tight">
                        {option.label}
                      </Text>
                      <Text className="text-xs text-craftopa-textSecondary font-nunito tracking-wide">
                        {option.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              /* Step 2: Add Details */
              <View className="p-5">
                {/* Selected Reason */}
                <View className="bg-craftopa-primary/5 p-4 rounded-2xl mb-4 border border-craftopa-primary/10">
                  <Text className="text-sm text-craftopa-textSecondary mb-1 font-nunito tracking-wide">
                    Reporting for:
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-xl mr-2">
                      {REPORT_OPTIONS.find(o => o.id === selectedReason)?.icon}
                    </Text>
                    <Text className="text-base font-poppinsBold text-craftopa-primary tracking-tight">
                      {REPORT_OPTIONS.find(o => o.id === selectedReason)?.label}
                    </Text>
                  </View>
                </View>

                {/* Details Input */}
                <View className="mb-4">
                  <Text className="text-sm font-poppinsBold text-craftopa-textPrimary mb-2 tracking-tight">
                    Additional details {selectedReason === 'other' ? '(Required)' : '(Optional)'}
                  </Text>
                  <TextInput
                    value={details}
                    onChangeText={(text) => {
                      setDetails(text);
                      setError(null);
                    }}
                    placeholder="Please provide more information..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                    textAlignVertical="top"
                    className="bg-white border border-craftopa-light/10 rounded-xl p-4 text-craftopa-textPrimary font-nunito tracking-wide"
                    style={{ minHeight: 100 }}
                    editable={!isSubmitting}
                  />
                  <Text className={`text-xs mt-2 font-nunito tracking-wide ${details.length > 450 ? 'text-orange-600' : 'text-craftopa-textSecondary'}`}>
                    {details.length}/500 characters
                  </Text>
                </View>

                {/* Info Box */}
                <View className="bg-craftopa-primary/5 border border-craftopa-primary/10 p-4 rounded-2xl mb-4">
                  <View className="flex-row items-start">
                    <CheckCircle size={16} color="#5A7160" className="mt-0.5" />
                    <Text className="text-sm text-craftopa-textPrimary ml-3 flex-1 font-nunito tracking-wide">
                      Your report will be reviewed by our moderation team. We'll take appropriate action if this violates our community guidelines.
                    </Text>
                  </View>
                </View>

                {/* Submit Button */}
                <Button
                  title={isSubmitting ? 'Submitting...' : 'Submit Report'}
                  onPress={handleSubmit}
                  disabled={!canSubmit || isSubmitting || loading}
                  loading={isSubmitting || loading}
                  size="md"
                />

                {/* Cancel Button */}
                <TouchableOpacity
                  onPress={handleBack}
                  className="mt-3 py-3 items-center active:opacity-70"
                  activeOpacity={0.7}
                  disabled={isSubmitting}
                >
                  <Text className="text-craftopa-textSecondary font-poppinsBold tracking-tight">
                    Back
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
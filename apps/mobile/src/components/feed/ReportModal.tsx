import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  TextInput, 
  ActivityIndicator, 
  Dimensions, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { X, Flag, AlertTriangle, CheckCircle } from 'lucide-react-native';
import Button from '~/components/common/Button';

const SCREEN_HEIGHT = Dimensions.get('window').height;

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
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Backdrop */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleClose}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        />

        {/* Modal Content */}
        <View 
          style={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: SCREEN_HEIGHT * 0.85,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-craftopia-light">
            <TouchableOpacity
              onPress={handleBack}
              className="w-9 h-9 items-center justify-center rounded-lg bg-craftopia-light active:opacity-70"
              activeOpacity={0.7}
              disabled={isSubmitting}
            >
              <X size={16} color="#3B6E4D" />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <Flag size={16} color="#D66B4E" />
              <Text className="text-lg font-poppinsBold text-craftopia-textPrimary ml-2">
                Report {contentType}
              </Text>
            </View>
            <View className="w-9" />
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-craftopia-error/10 border border-craftopia-error/20 mx-4 mt-3 p-3 rounded-lg flex-row items-center">
              <AlertTriangle size={14} color="#D66B4E" />
              <Text className="text-sm text-craftopia-error ml-2 flex-1 font-nunito">{error}</Text>
            </View>
          )}

          {/* Content */}
          <ScrollView 
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {step === 'select' ? (
              /* Step 1: Select Reason */
              <View className="p-4">
                <View className="bg-craftopia-primary/5 p-3 rounded-xl mb-3 flex-row border border-craftopia-primary/20">
                  <AlertTriangle size={18} color="#3B6E4D" />
                  <Text className="text-sm text-craftopia-textSecondary ml-3 flex-1 font-nunito">
                    Help us understand what's wrong with this {contentType}
                  </Text>
                </View>

                {REPORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => handleReasonSelect(option.id)}
                    className="bg-craftopia-surface p-3 rounded-xl mb-2 flex-row items-center border border-craftopia-light active:opacity-70"
                    activeOpacity={0.7}
                  >
                    <Text className="text-2xl mr-3">{option.icon}</Text>
                    <View className="flex-1">
                      <Text className="text-base font-poppinsBold text-craftopia-textPrimary mb-0.5">
                        {option.label}
                      </Text>
                      <Text className="text-xs text-craftopia-textSecondary font-nunito">
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
                <View className="bg-craftopia-primary/5 p-3 rounded-xl mb-3 border border-craftopia-primary/20">
                  <Text className="text-sm text-craftopia-textSecondary mb-1 font-nunito">
                    Reporting for:
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-xl mr-2">
                      {REPORT_OPTIONS.find(o => o.id === selectedReason)?.icon}
                    </Text>
                    <Text className="text-base font-poppinsBold text-craftopia-primary">
                      {REPORT_OPTIONS.find(o => o.id === selectedReason)?.label}
                    </Text>
                  </View>
                </View>

                {/* Details Input */}
                <View className="mb-3">
                  <Text className="text-sm font-poppinsBold text-craftopia-textPrimary mb-2">
                    Additional details {selectedReason === 'other' ? '(Required)' : '(Optional)'}
                  </Text>
                  <TextInput
                    value={details}
                    onChangeText={(text) => {
                      setDetails(text);
                      setError(null);
                    }}
                    placeholder="Please provide more information..."
                    placeholderTextColor="#5F6F64"
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                    textAlignVertical="top"
                    className="bg-craftopia-surface border border-craftopia-light rounded-lg p-3 text-craftopia-textPrimary font-nunito"
                    style={{ minHeight: 100 }}
                    editable={!isSubmitting}
                  />
                  <Text className={`text-xs mt-2 font-nunito ${details.length > 450 ? 'text-craftopia-warning' : 'text-craftopia-textSecondary'}`}>
                    {details.length}/500 characters
                  </Text>
                </View>

                {/* Info Box */}
                <View className="bg-craftopia-primary/5 border border-craftopia-primary/20 p-3 rounded-xl mb-3">
                  <View className="flex-row items-start">
                    <CheckCircle size={14} color="#3B6E4D" style={{ marginTop: 2 }} />
                    <Text className="text-sm text-craftopia-textPrimary ml-2 flex-1 font-nunito">
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
                  className="mt-2 py-2 items-center active:opacity-70"
                  activeOpacity={0.7}
                  disabled={isSubmitting}
                >
                  <Text className="text-craftopia-textSecondary font-poppinsBold">
                    Back
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
import React from 'react';
import { View, Text } from 'react-native';
import { Mail } from 'lucide-react-native';
import { FormSection } from './FormSection';

interface Props { email: string; }

export const EmailInfo: React.FC<Props> = ({ email }) => (
  <FormSection title="Account Email" icon={Mail} iconColor="#6B7280" iconBgColor="#F3F4F6">
    <View className="bg-gray-50 p-4 rounded-xl border border-gray-200">
      <Text className="text-base font-medium text-gray-900 mb-1">{email}</Text>
      <Text className="text-sm text-gray-600">Email cannot be changed here. Contact support if needed.</Text>
    </View>
  </FormSection>
);

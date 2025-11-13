import React from 'react';
import { View, Text } from 'react-native';
import { Mail } from 'lucide-react-native';
import { FormSection } from './FormSection';

interface Props { email: string; }

export const EmailInfo: React.FC<Props> = ({ email }) => (
  <FormSection title="Account Email" icon={Mail}>
    <View className="bg-craftopia-light p-3 rounded-lg border border-craftopia-light">
      <Text className="text-sm font-nunito text-craftopia-textPrimary mb-1">{email}</Text>
      <Text className="text-xs font-nunito text-craftopia-textSecondary">Email cannot be changed here</Text>
    </View>
  </FormSection>
);
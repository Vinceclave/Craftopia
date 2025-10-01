import React from 'react';
import { View, Text } from 'react-native';
import { Mail } from 'lucide-react-native';
import { FormSection } from './FormSection';

interface Props { email: string; }

export const EmailInfo: React.FC<Props> = ({ email }) => (
  <FormSection 
    title="Account Email" 
    icon={Mail} 
    iconColor="#5D6B5D" 
    iconBgColor="#5D6B5D/10"
  >
    <View className="bg-craftopia-light p-3 rounded-lg border border-craftopia-light/50">
      <Text className="text-sm font-medium text-craftopia-textPrimary mb-1">{email}</Text>
      <Text className="text-xs text-craftopia-textSecondary">Email cannot be changed here</Text>
    </View>
  </FormSection>
);
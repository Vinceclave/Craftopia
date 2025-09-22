import React from 'react';
import { View } from 'react-native';
import { User } from 'lucide-react-native';
import { Input } from '~/components/common/TextInputField';
import { FormSection } from './FormSection';

interface Props { name?: string; username: string; onNameChange: (text: string) => void; }

export const PersonalDetailsForm: React.FC<Props> = ({ name, username, onNameChange }) => (
  <FormSection title="Personal Details" icon={User} iconColor="#3B82F6" iconBgColor="#DBEAFE">
    <View className="space-y-4">
      <Input label="Full Name" value={name} placeholder="Enter your full name" onChangeText={onNameChange} />
      <Input label="Username" value={username} placeholder="Choose a unique username" editable={false} containerClassName="opacity-60" />
    </View>
  </FormSection>
);

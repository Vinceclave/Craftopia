import React from 'react';
import { FileText } from 'lucide-react-native';
import { Input } from '~/components/common/TextInputField';
import { FormSection } from './FormSection';

interface BioFormProps {
  bio?: string;
  onBioChange: (text: string) => void;
}

export const BioForm: React.FC<BioFormProps> = ({
  bio,
  onBioChange
}) => {
  return (
    <FormSection
      title="About You"
      icon={FileText}
      iconColor="#10B981"
      iconBgColor="#D1FAE5"
    >
      <Input 
        label="Bio" 
        placeholder="Tell us about yourself..." 
        value={bio} 
        onChangeText={onBioChange} 
        multiline 
        numberOfLines={4} 
        textAlignVertical="top" 
      />
    </FormSection>
  );
};
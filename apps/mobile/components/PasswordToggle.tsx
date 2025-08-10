import React from 'react';
import { Pressable } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

interface PasswordToggleProps {
  visible: boolean;
  onToggle: () => void;
}

const PasswordToggle: React.FC<PasswordToggleProps> = ({ visible, onToggle }) => {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityLabel={visible ? 'Hide password' : 'Show password'}
      hitSlop={8}
      style={{ paddingHorizontal: 8 }}
    >
      {visible ? (
        <EyeOff color="#2f855a" strokeWidth={2} width={24} height={24} />
      ) : (
        <Eye color="#2f855a" strokeWidth={2} width={24} height={24} />
      )}
    </Pressable>
  );
};

export default PasswordToggle;

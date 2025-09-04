// Button.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  loading = false, 
  disabled = false,
  variant = 'primary' 
}) => {
  const getButtonStyles = () => {
    const baseStyles = 'rounded-lg py-4 px-6 items-center';
    
    if (disabled || loading) {
      return `${baseStyles} opacity-50`;
    }
    
    switch (variant) {
      case 'secondary':
        return `${baseStyles} bg-craftopia-digital`;
      case 'outline':
        return `${baseStyles} bg-transparent border border-craftopia-neural`;
      default:
        return `${baseStyles} bg-craftopia-neural`;
    }
  };

  const getTextStyles = () => {
    if (variant === 'outline') {
      return 'text-craftopia-neural text-base font-semibold';
    }
    return 'text-white text-base font-semibold';
  };

  return (
    <TouchableOpacity
      className={getButtonStyles()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text className={getTextStyles()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
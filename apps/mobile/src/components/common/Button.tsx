import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  fullWidth = true,
  loading = false,
  ...props
}) => {
  let bgColor = 'bg-blue-600';
  let textColor = 'text-white';
  let border = '';

  if (variant === 'secondary') bgColor = 'bg-green-600';
  if (variant === 'outline') {
    bgColor = 'bg-transparent';
    textColor = 'text-blue-600';
    border = 'border border-blue-600';
  }

  return (
    <TouchableOpacity
      className={`${bgColor} ${border} ${fullWidth ? 'w-full' : ''} rounded-lg py-3 mb-4 flex-row justify-center items-center`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className={`${textColor} text-center font-semibold`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

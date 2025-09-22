// Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';

interface ButtonProps {
  title?: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  textClassName?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;
  style?: StyleProp<ViewStyle>;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  textClassName = '',
  leftIcon,
  rightIcon,
  iconOnly = false,
  style,
}) => {
  const getButtonStyles = () => {
    const base = iconOnly
      ? size === 'sm'
        ? 'rounded-lg p-2'
        : size === 'lg'
        ? 'rounded-lg p-4'
        : 'rounded-lg p-3'
      : size === 'sm'
      ? 'rounded-lg py-2 px-4'
      : size === 'lg'
      ? 'rounded-lg py-4 px-8'
      : 'rounded-lg py-3 px-6';

    const baseStyles = `${base} items-center ${
      iconOnly ? '' : 'flex-row justify-center'
    }`;

    if (disabled || loading) {
      return `${baseStyles} opacity-40 ${className}`;
    }

    switch (variant) {
      case 'secondary':
        return `${baseStyles} bg-craftopia-light ${className}`;
      case 'outline':
        return `${baseStyles} bg-transparent border border-craftopia-light ${className}`;
      default:
        return `${baseStyles} bg-craftopia-primary ${className}`;
    }
  };

  const getTextStyles = () => {
    const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base';

    switch (variant) {
      case 'secondary':
      case 'outline':
        return `text-craftopia-text-primary ${textSize} font-medium ${textClassName}`;
      default:
        return `text-white ${textSize} font-medium ${textClassName}`;
    }
  };

  return (
    <TouchableOpacity
      className={getButtonStyles()}
      style={style}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#fff' : '#374151'}
          size="small"
        />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          {title && <Text className={getTextStyles()}>{title}</Text>}
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;

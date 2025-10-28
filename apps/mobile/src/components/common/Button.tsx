// apps/mobile/src/components/common/Button.tsx
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
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  textClassName?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
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
  fullWidth = false,
}) => {
  const isDisabled = disabled || loading;

  const getButtonStyles = () => {
    // Size styles
    const sizeStyles = iconOnly
      ? size === 'sm'
        ? 'p-2'
        : size === 'lg'
        ? 'p-4'
        : 'p-3'
      : size === 'sm'
      ? 'py-2 px-4'
      : size === 'lg'
      ? 'py-4 px-8'
      : 'py-3 px-6';

    // Base styles
    const baseStyles = `${sizeStyles} items-center justify-center rounded-xl ${
      iconOnly ? '' : 'flex-row'
    } ${fullWidth ? 'w-full' : ''}`;

    // Variant styles with disabled state
    let variantStyles = '';
    switch (variant) {
      case 'secondary':
        variantStyles = isDisabled
          ? 'bg-gray-100'
          : 'bg-craftopia-light';
        break;
      case 'outline':
        variantStyles = isDisabled
          ? 'bg-transparent border border-gray-200'
          : 'bg-transparent border-2 border-craftopia-primary';
        break;
      case 'ghost':
        variantStyles = isDisabled
          ? 'bg-transparent'
          : 'bg-transparent';
        break;
      default:
        variantStyles = isDisabled
          ? 'bg-gray-300'
          : 'bg-craftopia-primary';
    }

    return `${baseStyles} ${variantStyles} ${className}`;
  };

  const getTextStyles = () => {
    const textSize =
      size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base';

    const fontWeight = 'font-semibold';

    let textColor = '';
    switch (variant) {
      case 'secondary':
        textColor = isDisabled ? 'text-gray-400' : 'text-craftopia-textPrimary';
        break;
      case 'outline':
      case 'ghost':
        textColor = isDisabled ? 'text-gray-400' : 'text-craftopia-primary';
        break;
      default:
        textColor = isDisabled ? 'text-gray-500' : 'text-white';
    }

    return `${textSize} ${fontWeight} ${textClassName || textColor}`;
  };

  const getActivityIndicatorColor = () => {
    if (variant === 'primary') return '#fff';
    return '#374A36';
  };

  return (
    <TouchableOpacity
      className={getButtonStyles()}
      style={[
        style,
        {
          shadowColor: !isDisabled && variant === 'primary' ? '#374A36' : 'transparent',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: !isDisabled && variant === 'primary' ? 2 : 0,
        }
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={getActivityIndicatorColor()}
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
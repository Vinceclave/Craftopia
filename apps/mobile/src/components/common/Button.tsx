import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, StyleProp, ViewStyle } from 'react-native';

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
    const sizeStyles = iconOnly
      ? size === 'sm'
        ? 'p-2'
        : size === 'lg'
        ? 'p-3'
        : 'p-2.5'
      : size === 'sm'
      ? 'py-2 px-3'
      : size === 'lg'
      ? 'py-3 px-6'
      : 'py-2.5 px-4';

    const baseStyles = `${sizeStyles} items-center justify-center rounded-lg ${
      iconOnly ? '' : 'flex-row'
    } ${fullWidth ? 'w-full' : ''}`;

    let variantStyles = '';
    switch (variant) {
      case 'secondary':
        variantStyles = isDisabled ? 'bg-gray-100' : 'bg-craftopia-light';
        break;
      case 'outline':
        variantStyles = isDisabled ? 'bg-transparent border border-gray-200' : 'bg-transparent border border-craftopia-primary';
        break;
      case 'ghost':
        variantStyles = 'bg-transparent';
        break;
      default:
        variantStyles = isDisabled ? 'bg-gray-300' : 'bg-craftopia-primary';
    }

    return `${baseStyles} ${variantStyles} ${className}`;
  };

  const getTextStyles = () => {
    const sizeText = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-sm';
    const color =
      variant === 'primary'
        ? isDisabled
          ? 'text-gray-500'
          : 'text-craftopia-surface'
        : variant === 'secondary'
        ? isDisabled
          ? 'text-gray-400'
          : 'text-craftopia-textPrimary'
        : isDisabled
        ? 'text-gray-400'
        : 'text-craftopia-primary';

    return `${sizeText} font-poppinsBold ${textClassName || color}`;
  };

  const getActivityIndicatorColor = () => (variant === 'primary' ? '#FFFFFF' : '#3B6E4D');

  return (
    <TouchableOpacity
      className={getButtonStyles()}
      style={[
        style,
        {
          shadowColor: !isDisabled && variant === 'primary' ? '#3B6E4D' : 'transparent',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: !isDisabled && variant === 'primary' ? 2 : 0,
        },
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getActivityIndicatorColor()} size="small" />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          {!iconOnly && title && <Text className={getTextStyles()}>{title}</Text>}
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;  
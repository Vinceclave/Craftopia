// apps/mobile/src/components/common/Button.tsx
import { CraftopiaTheme } from 'constants/theme';
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
  fullWidth = true,
}) => {
  const isDisabled = disabled || loading;

  const getVariantStyles = () => {
    const baseStyles = 'rounded-xl border-2 items-center justify-center flex-row';
    
    switch (variant) {
      case 'primary':
        return `${baseStyles} ${
          isDisabled 
            ? 'bg-gray-300 border-gray-300' 
            : 'bg-craftopia-primary-500 border-craftopia-primary-500 active:bg-craftopia-primary-600'
        }`;
      case 'secondary':
        return `${baseStyles} ${
          isDisabled
            ? 'bg-craftopia-primary-100 border-craftopia-primary-100'
            : 'bg-craftopia-primary-100 border-craftopia-primary-100 active:bg-craftopia-primary-200'
        }`;
      case 'outline':
        return `${baseStyles} ${
          isDisabled
            ? 'bg-transparent border-craftopia-border-medium'
            : 'bg-transparent border-craftopia-primary-500 active:bg-craftopia-primary-50'
        }`;
      case 'ghost':
        return `${baseStyles} ${
          isDisabled
            ? 'bg-transparent border-transparent'
            : 'bg-transparent border-transparent active:bg-craftopia-primary-50'
        }`;
      default:
        return baseStyles;
    }
  };

  const getSizeStyles = () => {
    if (iconOnly) {
      return size === 'sm' ? 'p-2' : size === 'lg' ? 'p-4' : 'p-3';
    }
    
    const vertical = size === 'sm' ? 'py-2' : size === 'lg' ? 'py-4' : 'py-3';
    const horizontal = size === 'sm' ? 'px-4' : size === 'lg' ? 'px-8' : 'px-6';
    return `${vertical} ${horizontal}`;
  };

  const getTextStyles = () => {
    const sizeStyles = 
      size === 'sm' ? 'text-sm' : 
      size === 'lg' ? 'text-lg' : 'text-base';
    
    const weightStyles = 'font-poppins font-semibold';
    
    switch (variant) {
      case 'primary':
        return `${sizeStyles} ${weightStyles} text-white`;
      case 'secondary':
        return `${sizeStyles} ${weightStyles} text-craftopia-primary-600`;
      case 'outline':
        return `${sizeStyles} ${weightStyles} text-craftopia-primary-500`;
      case 'ghost':
        return `${sizeStyles} ${weightStyles} text-craftopia-primary-500`;
      default:
        return `${sizeStyles} ${weightStyles} text-white`;
    }
  };

  const getShadowStyles = () => {
    if (isDisabled || variant !== 'primary') return {};
    return CraftopiaTheme.shadows.sm;
  };

  return (
    <TouchableOpacity
      className={`
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={[getShadowStyles(), style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary' ? '#FFFFFF' : CraftopiaTheme.colors.primary[500]
          }
        />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          {title && (
            <Text className={`${getTextStyles()} ${textClassName}`}>
              {title}
            </Text>
          )}
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;

// apps/mobile/src/components/common/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps, ViewStyle } from 'react-native';

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
  const getButtonStyles = (): ViewStyle => {
    const baseStyles: ViewStyle = {
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 20,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: fullWidth ? '100%' : undefined,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: '#FF6700',
          shadowColor: '#FF6700',
        };
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: '#00A896',
          shadowColor: '#00A896',
        };
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: '#004E98',
          shadowOpacity: 0.08,
          shadowColor: '#000',
        };
      default:
        return baseStyles;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return '#FFFFFF';
      case 'outline':
        return '#004E98';
      default:
        return '#FFFFFF';
    }
  };

  return (
    <TouchableOpacity
      style={[
        getButtonStyles(),
        { opacity: loading || props.disabled ? 0.7 : 1 }
      ]}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text 
          style={{ 
            color: getTextColor(),
            fontSize: 16,
            fontWeight: '700',
            textAlign: 'center'
          }}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// apps/mobile/src/components/common/TextInputField.tsx
import React, { useState, forwardRef } from 'react';
import { TextInput, View, Text, TouchableOpacity, TextInputProps } from 'react-native';
import { Eye, EyeOff, AlertCircle } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  secure?: boolean;
  error?: string;
  nextInputRef?: React.RefObject<TextInput | null>;
  isLastInput?: boolean;
  onSubmit?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  helper?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      secure,
      error,
      nextInputRef,
      isLastInput,
      onSubmit,
      leftIcon,
      rightIcon,
      containerClassName = '',
      helper,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View className={`mb-4 ${containerClassName}`}>
        {label && (
          <Text className="text-sm font-semibold mb-2" style={{ color: '#1A1A1A' }}>
            {label}
          </Text>
        )}

        <View
          className={`flex-row items-center px-4 py-3 rounded-xl border-2 bg-white`}
          style={{
            borderColor: error
              ? '#DC2626'
              : isFocused
              ? '#374A36'
              : '#E5E7EB',
            shadowColor: isFocused ? '#374A36' : 'transparent',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: isFocused ? 2 : 0,
          }}
        >
          {leftIcon && <View className="mr-3">{leftIcon}</View>}

          <TextInput
            ref={ref}
            className="flex-1 text-base"
            style={{ color: '#1A1A1A' }}
            placeholderTextColor="#9CA3AF"
            secureTextEntry={secure && !showPassword}
            returnKeyType={isLastInput ? 'done' : 'next'}
            blurOnSubmit={isLastInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={() => {
              if (isLastInput && onSubmit) {
                onSubmit();
              } else if (nextInputRef?.current) {
                nextInputRef.current.focus();
              }
            }}
            {...props}
          />

          {secure && (
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="ml-2 p-1"
              activeOpacity={0.7}
            >
              {showPassword ? (
                <EyeOff size={20} color="#6B7280" />
              ) : (
                <Eye size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
          )}

          {rightIcon && !secure && (
            <View className="ml-3">{rightIcon}</View>
          )}
        </View>

        {error && (
          <View className="flex-row items-center mt-2">
            <AlertCircle size={14} color="#DC2626" />
            <Text className="text-sm ml-1" style={{ color: '#DC2626' }}>
              {error}
            </Text>
          </View>
        )}

        {helper && !error && (
          <Text className="text-xs mt-2" style={{ color: '#6B7280' }}>
            {helper}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
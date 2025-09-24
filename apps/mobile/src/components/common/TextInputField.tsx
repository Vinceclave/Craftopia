// TextInputField.tsx
import React, { useState, forwardRef } from 'react';
import { TextInput, View, Text, TouchableOpacity, TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  secure?: boolean;
  error?: string;
  nextInputRef?: React.RefObject<TextInput | null>;
  isLastInput?: boolean;
  onSubmit?: () => void;
  leftIcon?: React.ReactNode;
  containerClassName?: string;
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
      containerClassName = '',
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View className={`mb-3 ${containerClassName}`}>
        {label && (
          <Text className="text-craftopia-textSecondary text-sm mb-1.5 font-medium">
            {label}
          </Text>
        )}

        <View
          className={`flex-row items-center px-3 py-2 rounded-lg border ${
            error
              ? 'border-red-500'
              : isFocused
              ? 'border-craftopia-primary'
              : 'border-craftopia-light'
          } bg-craftopia-surface`}
        >
          {leftIcon && <View className="mr-2">{leftIcon}</View>}

          <TextInput
            ref={ref}
            className="flex-1 text-craftopia-textPrimary text-sm"
            placeholderTextColor="#6B7280"
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
              className="ml-1 p-1"
            >
              {showPassword ? (
                <EyeOff size={16} color="#6B7280" />
              ) : (
                <Eye size={16} color="#6B7280" />
              )}
            </TouchableOpacity>
          )}
        </View>

        {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
      </View>
    );
  }
);
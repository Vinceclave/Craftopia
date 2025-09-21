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
  ({ 
    label, 
    secure, 
    error, 
    nextInputRef, 
    isLastInput, 
    onSubmit, 
    leftIcon, 
    containerClassName = '', 
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View className={`relative mb-4 ${containerClassName}`}>
        {label && (
          <Text className="text-gray-600 text-sm mb-2 font-medium">
            {label}
          </Text>
        )}

        <View className={`bg-gray-50 rounded-lg px-3 py-2 flex-row items-center border ${
            error 
              ? 'border-red-400' 
              : isFocused 
                ? 'border-gray-300' 
                : 'border-gray-100'
          }`}>
          
          {leftIcon && <View className="mr-2">{leftIcon}</View>}

          <TextInput
            ref={ref}
            className="flex-1 text-gray-900 text-sm"
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
            >
              {showPassword ? (
                <EyeOff size={18} color="#6B7280" />
              ) : (
                <Eye size={18} color="#6B7280" />
              )}
            </TouchableOpacity>
          )}
        </View>

        {error && (
          <Text className="text-red-500 text-sm mt-1">
            {error}
          </Text>
        )}
      </View>
    );
  }
);
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
      <View className={`mb-3 ${containerClassName}`}>
        {label && (
          <Text className="text-sm font-poppinsBold mb-2 text-craftopia-textPrimary">
            {label}
          </Text>
        )}

        <View
          className="flex-row items-center px-3 py-2.5 rounded-lg bg-craftopia-surface"
          style={{
            borderWidth: 1,
            borderColor: error ? '#D66B4E' : isFocused ? '#3B6E4D' : '#F5F7F2',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isFocused ? 0.1 : 0,
            shadowRadius: 2,
            elevation: isFocused ? 1 : 0,
          }}
        >
          {leftIcon && <View className="mr-2">{leftIcon}</View>}

          <TextInput
            ref={ref}
            className="flex-1 text-sm font-nunito text-craftopia-textPrimary"
            placeholderTextColor="#5F6F64"
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
              activeOpacity={0.7}
            >
              {showPassword ? <EyeOff size={16} color="#5F6F64" /> : <Eye size={16} color="#5F6F64" />}
            </TouchableOpacity>
          )}

          {rightIcon && !secure && <View className="ml-2">{rightIcon}</View>}
        </View>

        {error ? (
          <View className="flex-row items-center mt-1">
            <AlertCircle size={12} color="#D66B4E" />
            <Text className="text-xs font-nunito ml-1 text-craftopia-error">
              {error}
            </Text>
          </View>
        ) : (
          helper && (
            <Text className="text-xs font-nunito mt-1 text-craftopia-textSecondary">
              {helper}
            </Text>
          )
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
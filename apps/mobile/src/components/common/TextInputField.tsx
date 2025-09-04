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
}

const Input = forwardRef<TextInput, InputProps>(
  ({ label, secure, error, nextInputRef, isLastInput, onSubmit, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View className="mb-4">
        {label && (
          <Text className="text-craftopia-text-secondary text-sm mb-2 font-medium">
            {label}
          </Text>
        )}

        <View
          className={`bg-craftopia-surface rounded-xl px-4 py-4 flex-row items-center border-2 ${
            error 
              ? 'border-craftopia-energy' 
              : isFocused 
                ? 'border-craftopia-digital' 
                : 'border-craftopia-accent'
          } shadow-sm`}
        >
          <TextInput
            ref={ref}
            className="flex-1 text-craftopia-text-primary text-base"
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
                <EyeOff size={22} color="#6B7280" />
              ) : (
                <Eye size={22} color="#6B7280" />
              )}
            </TouchableOpacity>
          )}
        </View>

        {error && (
          <Text className="text-craftopia-energy text-sm mt-2">
            {error}
          </Text>
        )}
      </View>
    );
  }
);

export default Input;
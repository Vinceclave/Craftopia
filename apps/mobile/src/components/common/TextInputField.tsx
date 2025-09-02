import React from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';

interface TextInputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const TextInputField: React.FC<TextInputFieldProps> = ({
  label,
  error,
  ...props
}) => {
  return (
    <View className="mb-4">
      {label && <Text className="text-gray-700 mb-1 font-medium">{label}</Text>}
      <TextInput
        className={`border rounded-lg px-4 py-3 ${error ? 'border-red-500' : 'border-gray-300'}`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
};

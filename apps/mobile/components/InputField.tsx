import React from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';

interface InputFieldProps extends TextInputProps {
  label: string;
  isFocused: boolean;
  onFocusField: () => void;
  onBlurField: () => void;
}

const InputField = ({
  label,
  isFocused,
  onFocusField,
  onBlurField,
  ...props
}: InputFieldProps) => {
  return (
    <View className="w-full">
      <Text className="text-forest font-openSans text-sm mb-1">{label}</Text>
      <TextInput
        {...props}
        onFocus={onFocusField}
        onBlur={onBlurField}
        className={`w-full px-4 py-3 rounded-xl border text-darkgray font-openSans text-base bg-softwhite ${
          isFocused ? 'border-forest' : 'border-lightgray'
        }`}
      />
    </View>
  );
};

export default InputField;

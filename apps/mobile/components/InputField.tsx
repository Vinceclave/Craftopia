import { MotiText } from 'moti';
import React from 'react';
import { View, TextInput, Text, TextInputProps } from 'react-native';

interface InputFieldProps extends TextInputProps {
  label: string;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  isFocused?: boolean;
  onChangeText: (text: string) => void;
  onFocusField: () => void;
  onBlurField: () => void;
  error?: string;
  rightIcon?: React.ReactNode;
  accessibilityLabel?: string;
  inputContainerClassName?: string;
  inputRef?: React.Ref<TextInput>;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'none',
  secureTextEntry = false,
  isFocused,
  onChangeText,
  onFocusField,
  onBlurField,
  error,
  rightIcon,
  accessibilityLabel,
  inputContainerClassName = '',
  inputRef,
  ...rest
}) => {
  return (
    <View className="flex flex-col mb-2">
      <Text className="text-sm font-medium mb-0.5 text-gray-700">{label}</Text>
      <View
        className={`flex-row items-center border rounded-md px-2 py-1.5 ${inputContainerClassName}`}
      >
        <TextInput
          ref={inputRef}
          placeholder={placeholder}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          onChangeText={onChangeText}
          onFocus={onFocusField}
          onBlur={onBlurField}
          accessibilityLabel={accessibilityLabel || label}
          className="flex-1 text-sm text-gray-900"
          {...rest}
        />
        {rightIcon && <View className="ml-1">{rightIcon}</View>}
      </View>
      {error ? (
        <MotiText
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          accessibilityLiveRegion="polite"
          className="text-red-600 text-xs mt-1 font-openSans"
        >
          {error}
        </MotiText>
      ) : null}
    </View>
  );
};

export default InputField;

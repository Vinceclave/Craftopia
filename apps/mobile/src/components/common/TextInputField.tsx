// apps/mobile/src/components/common/TextInputField.tsx
import React from 'react';
import { TextInput, TextInputProps, View, Text, ViewStyle, TextStyle } from 'react-native';

interface TextInputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const TextInputField: React.FC<TextInputFieldProps> = ({
  label,
  error,
  style,
  ...props
}) => {
  const containerStyle: ViewStyle = {
    marginBottom: 16,
  };

  const labelStyle: TextStyle = {
    color: '#004E98',
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '600',
  };

  const inputStyle: ViewStyle = {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: error ? '#FF6700' : 'rgba(0, 0, 0, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#004E98',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  };

  const errorStyle: TextStyle = {
    color: '#FF6700',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  };

  return (
    <View style={containerStyle}>
      {label && <Text style={labelStyle}>{label}</Text>}
      <TextInput
        style={[inputStyle, style]}
        placeholderTextColor="#333333"
        {...props}
      />
      {error && <Text style={errorStyle}>{error}</Text>}
    </View>
  );
};

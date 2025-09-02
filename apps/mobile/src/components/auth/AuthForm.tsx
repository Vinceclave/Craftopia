import React from 'react';
import { View } from 'react-native';
import { TextInputField } from '../common/TextInputField';
import { Button } from '../common/Button';

export interface AuthField {
  name: string;
  label: string;
  placeholder: string;
  secure?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}

interface AuthFormProps {
  fields: AuthField[];
  values: Record<string, string>;
  errors?: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onSubmit: () => void;
  submitTitle: string;
  loading?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  fields,
  values,
  errors = {},
  onChange,
  onSubmit,
  submitTitle,
  loading = false,
}) => {
  return (
    <View>
      {fields.map((field) => (
        <TextInputField
          key={field.name}
          label={field.label}
          placeholder={field.placeholder}
          secureTextEntry={field.secure}
          keyboardType={field.keyboardType}
          value={values[field.name]}
          onChangeText={(text) => onChange(field.name, text)}
          error={errors[field.name]}
        />
      ))}

      <Button title={submitTitle} onPress={onSubmit} loading={loading} />
    </View>
  );
};

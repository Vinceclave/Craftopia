// apps/mobile/src/components/auth/AuthForm.tsx
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

interface AuthFormProps<T extends Record<string, string> = Record<string, string>> {
  fields: AuthField[];
  values: T;
  errors?: Partial<Record<keyof T, string>>;
  onChange: (name: string, value: string) => void;
  onSubmit: () => void;
  submitTitle: string;
  loading?: boolean;
}

export const AuthForm = <T extends Record<string, string>>({
  fields,
  values,
  errors = {},
  onChange,
  onSubmit,
  submitTitle,
  loading = false,
}: AuthFormProps<T>) => {
  return (
    <View>
      {fields.map((field) => (
        <TextInputField
          key={field.name}
          label={field.label}
          placeholder={field.placeholder}
          secureTextEntry={field.secure}
          keyboardType={field.keyboardType}
          value={values[field.name] || ''}
          onChangeText={(text) => onChange(field.name, text)}
          error={errors[field.name as keyof T]}
        />
      ))}

      <Button title={submitTitle} onPress={onSubmit} loading={loading} />
    </View>
  );
};
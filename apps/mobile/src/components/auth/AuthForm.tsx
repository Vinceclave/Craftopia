  import React, { useRef } from 'react';
  import { View, TextInput } from 'react-native';
  import { Button } from '../common/Button';

  export interface AuthField {
    name: string;
    label: string;
    placeholder: string;
    secure?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  }
      
  interface AuthFormProps<T extends Record<string, string>> {
    title: string;
    subtitle?: string;
    fields: AuthField[];
    values: T;
    errors?: Partial<Record<keyof T, string>>;
    onChange: (name: keyof T, value: string) => void;
    onSubmit: () => void;
    submitTitle: string;
    loading?: boolean;
    bottomLink?: { text: string; highlight: string; action: () => void };
    helpBox?: { title: string; message: string };
    onForgot?: () => void;
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
    // Create a ref array to manage TextInput focus
    const inputRefs = useRef<(TextInput | null)[]>([]);

    return (
      <View className="space-y-4">
        {fields.map(({ name, label, placeholder, secure, keyboardType }, index) => (
          <TextInputField
            key={name}
            ref={(el) => (inputRefs.current[index] = el)} // assign ref
            label={label}
            placeholder={placeholder}
            secureTextEntry={secure}
            keyboardType={keyboardType}
            returnKeyType={index === fields.length - 1 ? 'done' : 'next'} // last input = done
            onSubmitEditing={() => {
              if (index < fields.length - 1) {
                inputRefs.current[index + 1]?.focus(); // focus next input
              } else {
                onSubmit(); // last input triggers submit
              }
            }}
            value={values[name]}
            onChangeText={(text) => onChange(name, text)}
            error={errors[name]}
          />
        ))}

        <Button title={submitTitle} onPress={onSubmit} loading={loading} />
      </View>
    );
  };

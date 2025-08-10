// components/auth/login/LoginForm.tsx
import React, { useRef, useEffect } from 'react';
import { TextInput } from 'react-native';
import { MotiView } from 'moti';
import InputField from 'components/InputField';
import PasswordToggle from 'components/PasswordToggle';

interface FormData {
  email: string;
  password: string;
}

interface Props {
  form: FormData;
  errors: { email?: string; password?: string };
  onFieldChange: (field: keyof FormData, value: string) => void;
}

const LoginForm: React.FC<Props> = ({ form, errors, onFieldChange }) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const emailInputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => {
      emailInputRef.current?.focus();
    }, 300);
  }, []);

  const getBorderColor = (fieldName: keyof FormData) => {
    if (errors[fieldName]) return 'border-red-600';
    return 'border-gray-300';
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: 300, duration: 500 }}
      className="space-y-4"
    >
      <InputField
        label="Email Address"
        placeholder="e.g., your@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={(text) => onFieldChange('email', text)}
        onFocusField={() => {}}
        onBlurField={() => {}}
        error={errors.email}
        accessibilityLabel="Email address input"
        inputRef={emailInputRef}
        inputContainerClassName={getBorderColor('email')}
      />

      <InputField
        label="Password"
        placeholder="••••••••"
        secureTextEntry={!showPassword}
        onChangeText={(text) => onFieldChange('password', text)}
        onFocusField={() => {}}
        onBlurField={() => {}}
        error={errors.password}
        rightIcon={
          form.password.length > 0 ? (
            <PasswordToggle
              visible={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
            />
          ) : null
        }
        accessibilityLabel="Password input"
        inputContainerClassName={getBorderColor('password')}
      />
    </MotiView>
  );
};

export default LoginForm;

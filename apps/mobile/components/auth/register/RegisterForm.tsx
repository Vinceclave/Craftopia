import React, { useEffect, useRef, useState } from 'react';
import { TextInput } from 'react-native';
import { MotiView, MotiText } from 'moti';
import InputField from 'components/InputField';
import PasswordToggle from 'components/PasswordToggle';

interface Props {
  form: { username: string; email: string; password: string; confirmPassword: string };
  focused: string | null;
  setFocused: (val: string | null) => void;
  errors: { [key: string]: string | undefined };
  onFieldChange: (field: string, value: string) => void;
}

const RegisterForm: React.FC<Props> = ({ form, focused, setFocused, errors, onFieldChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auto focus username input on mount
  const usernameInputRef = useRef<TextInput>(null);
  useEffect(() => {
    setTimeout(() => {
      usernameInputRef.current?.focus();
    }, 300);
  }, []);

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { label: '', color: '' };
    if (password.length < 8) return { label: 'Too short', color: 'text-red-500' };
    const strongPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
    if (strongPattern.test(password)) return { label: 'Strong', color: 'text-green-600' };
    return { label: 'Weak', color: 'text-yellow-500' };
  };

  const pwdStrength = getPasswordStrength(form.password);

  // Animated border color helper for inputs
  const getBorderColor = (fieldName: string) => {
    if (errors[fieldName]) return 'border-red-600';
    if (focused === fieldName) return 'border-forest';
    return 'border-gray-300';
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: 300, duration: 400 }}
      className="space-y-3"
    >
      <InputField
        label="Username"
        placeholder="e.g., craftyMaya123"
        autoCapitalize="none"
        isFocused={focused === 'username'}
        onChangeText={(text) => onFieldChange('username', text)}
        onFocusField={() => setFocused('username')}
        onBlurField={() => setFocused(null)}
        error={errors.username}
        accessibilityLabel="Username input"
        inputRef={usernameInputRef}
        inputContainerClassName={getBorderColor('username')}
      />

      <InputField
        label="Email Address"
        placeholder="e.g., your@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        isFocused={focused === 'email'}
        onChangeText={(text) => onFieldChange('email', text)}
        onFocusField={() => setFocused('email')}
        onBlurField={() => setFocused(null)}
        error={errors.email}
        accessibilityLabel="Email address input"
        inputContainerClassName={getBorderColor('email')}
      />

      <InputField
        label="Password"
        placeholder="••••••••"
        secureTextEntry={!showPassword}
        isFocused={focused === 'password'}
        onChangeText={(text) => onFieldChange('password', text)}
        onFocusField={() => setFocused('password')}
        onBlurField={() => setFocused(null)}
        error={errors.password}
        rightIcon={
          form.password.length > 0 ? (
            <PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />
          ) : null
        }
        accessibilityLabel="Password input"
        inputContainerClassName={getBorderColor('password')}
      />
      {!!form.password.length && (
        <MotiText
          className={`text-xs font-openSans ${pwdStrength.color} mb-1`}
          animate={{ opacity: 1 }}
          from={{ opacity: 0 }}
          transition={{ duration: 300 }}
        >
          Password strength: {pwdStrength.label}
        </MotiText>
      )}

      <InputField
        label="Confirm Password"
        placeholder="••••••••"
        secureTextEntry={!showConfirmPassword}
        isFocused={focused === 'confirmPassword'}
        onChangeText={(text) => onFieldChange('confirmPassword', text)}
        onFocusField={() => setFocused('confirmPassword')}
        onBlurField={() => setFocused(null)}
        error={errors.confirmPassword}
        rightIcon={
          form.confirmPassword.length > 0 ? (
            <PasswordToggle visible={showConfirmPassword} onToggle={() => setShowConfirmPassword((v) => !v)} />
          ) : null
        }
        accessibilityLabel="Confirm password input"
        inputContainerClassName={getBorderColor('confirmPassword')}
      />
    </MotiView>
  );
};

export default RegisterForm;

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '~/navigations/AuthNavigator';

import AuthLayout from '~/components/auth/AuthLayout';
import Button from '~/components/common/Button';
import { Input } from '~/components/common/TextInputField';
import { useAlert } from '~/hooks/useAlert';
import {
  validateRegister,
  RegisterFormValues,
  RegisterFormErrors,
} from '~/utils/validator';
import debounce from 'lodash.debounce';
import { useRegister } from '~/hooks/useAuth';

type RegisterNavProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterNavProp>();
  const { success, error: showError } = useAlert();

  const [form, setForm] = useState<RegisterFormValues>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<RegisterFormErrors>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  // Get register mutation from TanStack Query
  const registerMutation = useRegister();

  // Debounced validation
  const debouncedValidate = useCallback(
    debounce((values: RegisterFormValues) => {
      setErrors(validateRegister(values));
    }, 400),
    []
  );

  const updateForm = (field: keyof RegisterFormValues, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    debouncedValidate(updated);
  };

  const handleRegister = async () => {
    const validationErrors = validateRegister(form);
    if (Object.values(validationErrors).some((err) => err)) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Use TanStack Query mutation
      await registerMutation.mutateAsync({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      success(
        'Registration Successful! 🎉', 
        'Please check your email to verify your account before signing in.',
        () => {
          navigation.navigate('VerifyEmail', { email: form.email.trim() });
        }
      );
    } catch (err: any) {
      // Handle specific error cases
      if (err.message?.toLowerCase().includes('username')) {
        setErrors(prev => ({ ...prev, username: err.message }));
      } else if (err.message?.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: err.message }));
      } else {
        showError('Registration Failed', err.message || 'Something went wrong. Please try again.');
      }
    }
  };

  const isFormValid = 
    form.username.trim() && 
    form.email.trim() && 
    form.password.trim() && 
    form.confirmPassword.trim() &&
    !Object.values(errors).some(err => err);

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join our creative community and start building amazing projects"
    >
      <View>
        <Input
          label="Username"
          placeholder="Choose a username"
          value={form.username}
          onChangeText={(text) => updateForm('username', text)}
          autoCapitalize="none"
          autoComplete="username"
          nextInputRef={emailRef}
          error={errors.username}
        />

        <Input
          ref={emailRef}
          label="Email Address"
          placeholder="Enter your email"
          value={form.email}
          onChangeText={(text) => updateForm('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          nextInputRef={passwordRef}
          error={errors.email}
        />

        <Input
          ref={passwordRef}
          label="Password"
          placeholder="Create a password"
          value={form.password}
          onChangeText={(text) => updateForm('password', text)}
          secure
          nextInputRef={confirmPasswordRef}
          error={errors.password}
        />

        <Input
          ref={confirmPasswordRef}
          label="Confirm Password"
          placeholder="Confirm your password"
          value={form.confirmPassword}
          onChangeText={(text) => updateForm('confirmPassword', text)}
          secure
          isLastInput
          onSubmit={handleRegister}
          error={errors.confirmPassword}
        />

        <View className="mt-6">
          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={registerMutation.isPending} // TanStack Query loading state
            disabled={!isFormValid || registerMutation.isPending}
          />
        </View>

        <View className="mt-8 items-center space-y-4">
          <View className="flex-row items-center">
            <Text className="text-craftopia-textSecondary text-base font-nunito">
              Already have an account?{' '}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Login')}
              disabled={registerMutation.isPending}
            >
              <Text className="text-craftopia-primary text-base font-poppinsBold">
                Sign In
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-craftopia-textSecondary text-sm text-center leading-relaxed font-nunito">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </AuthLayout>
  );
};

export default RegisterScreen;
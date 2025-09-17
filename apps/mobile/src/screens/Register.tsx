// apps/mobile/src/screens/Register.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '~/navigations/AuthNavigator';
import AuthLayout from '~/components/auth/AuthLayout';
import Button from '~/components/common/Button';
import Input from '~/components/common/TextInputField';
import { useAuth } from '~/context/AuthContext';
import {
  validateRegister,
  RegisterFormValues,
  RegisterFormErrors,
} from '~/utils/validator';
import debounce from 'lodash.debounce';

type RegisterNavProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterNavProp>();
  const { register, error, clearError } = useAuth();

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

  const [loading, setLoading] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  // Clear auth errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Show auth errors
  useEffect(() => {
    if (error) {
      Alert.alert('Registration Failed', error, [{ text: 'OK' }]);
    }
  }, [error]);

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

  setLoading(true);
  clearError();

  await register({
    username: form.username.trim(),
    email: form.email.trim(),
    password: form.password,
  });

  // ✅ Only navigate if there’s no error in context
  if (!error) {
    navigation.navigate('VerifyEmail', { email: form.email.trim() });
  }

  setLoading(false);
};


  const isFormValid = form.username.trim() && 
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
            loading={loading}
            disabled={!isFormValid || loading}
          />
        </View>

        <View className="mt-8 items-center space-y-4">
          <View className="flex-row items-center">
            <Text className="text-craftopia-text-secondary text-base">
              Already have an account?{' '}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
            >
              <Text className="text-craftopia-digital text-base font-semibold">
                Sign In
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-craftopia-text-secondary text-sm text-center leading-relaxed">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </AuthLayout>
  );
};

export default RegisterScreen;
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '~/navigations/AuthNavigator';

import AuthLayout from '~/components/auth/AuthLayout';
import Button from '~/components/common/Button';
import { Input } from '~/components/common/TextInputField';
import { validateLogin, LoginFormValues, LoginFormErrors } from '~/utils/validator';
import { useAlert } from '~/hooks/useAlert';
import debounce from 'lodash.debounce';
import { useLogin } from '~/hooks/useAuth';
import { useCallback, useRef, useState } from 'react';

type LoginNavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNavProp>();
  const { alert, error: showError } = useAlert();

  const [form, setForm] = useState<LoginFormValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<LoginFormErrors>({ email: '', password: '' });

  const passwordRef = useRef<TextInput>(null);

  // Get login mutation from TanStack Query
  const loginMutation = useLogin();

  // Debounced validation
  const debouncedValidate = useCallback(
    debounce((values: LoginFormValues) => {
      setErrors(validateLogin(values));
    }, 400),
    []
  );

  const updateForm = (field: keyof LoginFormValues, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    debouncedValidate(updated);
  };

  const handleLogin = async () => {
    const validationErrors = validateLogin(form);
    if (Object.values(validationErrors).some((err) => err)) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Use TanStack Query mutation
      await loginMutation.mutateAsync({
        email: form.email.trim(),
        password: form.password,
      });

      // Success! Navigation will happen automatically via AppNavigator
      console.log('Login successful!');
    } catch (err: any) {
      // Handle different error types
      if (err.message?.toLowerCase().includes('verify') || 
          err.message?.toLowerCase().includes('email')) {
        alert('Email Verification Required', 
          'Please check your email and verify your account before signing in.', 
          () => {
            navigation.navigate('VerifyEmail', { email: form.email.trim() });
          }
        );
      } else {
        showError('Login Failed', err.message || 'Something went wrong. Please try again.');
      }
    }
  };

  const isFormValid = 
    form.email.trim() &&
    form.password.trim() &&
    !Object.values(errors).some((err) => err);

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to continue your creative journey">
      <View>
        <Input
          label="Email"
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
          placeholder="Enter your password"
          value={form.password}
          onChangeText={(text) => updateForm('password', text)}
          secure
          isLastInput
          onSubmit={handleLogin}
          error={errors.password}
        />
         <View className="mt-2 items-end">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ForgotPassword')}
              disabled={loginMutation.isPending}
            >
              <Text className="text-sm font-nunito text-craftopia-accent">
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>
        <View className="mt-6">
          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loginMutation.isPending}
            disabled={!isFormValid || loginMutation.isPending}
          />
        </View>

        <View className="mt-8 items-center">
          <View className="flex-row items-center mb-4">
            <Text className="text-base font-nunito text-craftopia-textSecondary">
              Don't have an account?
            </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Register')}
              disabled={loginMutation.isPending}
            >
              <Text className="text-base font-poppinsBold text-craftopia-primary ml-1">
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </AuthLayout>
  );
};

export default LoginScreen;
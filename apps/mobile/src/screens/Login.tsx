// apps/mobile/src/screens/Login.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '~/navigations/AuthNavigator';
import AuthLayout from '~/components/auth/AuthLayout';
import Button from '~/components/common/Button';
import Input from '~/components/common/TextInputField';
import { useAuth } from '~/context/AuthContext';
import { validateLogin, LoginFormValues, LoginFormErrors } from '~/utils/validator';
import debounce from 'lodash.debounce';

type LoginNavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNavProp>();
  const { login, error, clearError } = useAuth();

  const [form, setForm] = useState<LoginFormValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<LoginFormErrors>({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  // Clear auth errors when component mounts
  useEffect(() => {
    clearError(); 
  }, [clearError]);

  // Show auth errors
  useEffect(() => {
    if (error) {
      Alert.alert('Login Failed', error, [{ text: 'OK' }]);
    }
  }, [error]);

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

    setLoading(true);
    clearError();

    try {
      await login({
        email: form.email.trim(),
        password: form.password,
      });
      
      // Navigation will be handled automatically by AuthContext/AppNavigator
      console.log('Login successful, navigation handled by context');
      
    } catch (error) {
      // Error is handled by useAuth context
      console.log('Login error handled by context');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = form.email.trim() && 
                     form.password.trim() &&
                     !Object.values(errors).some(err => err);

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

        <View className="mt-6">
          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            disabled={!isFormValid || loading}
          />
        </View>

        <View className="mt-8 items-center">
          <View className="flex-row items-center mb-4">
            <Text className="text-craftopia-text-secondary text-base">
              Don't have an account?{' '}
              <Text 
                className="text-craftopia-digital text-base font-semibold"
                onPress={() => navigation.navigate('Register')}
              >
                Sign Up
              </Text>
            </Text>
          </View>
          
          <TouchableOpacity 
            className="mt-2" 
            activeOpacity={0.7}
            disabled={loading}
          >
            <Text className="text-craftopia-spark text-sm">
              Forgot Password?
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="mt-4" 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('VerifyEmail', {})}
            disabled={loading}
          >
            <Text className="text-craftopia-spark text-sm">
              Need to verify your email?
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthLayout>
  );
};

export default LoginScreen;
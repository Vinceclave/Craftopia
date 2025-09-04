// LoginScreen.tsx
import React, { useState, useRef } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import AuthLayout from '~/components/auth/AuthLayout';
import Button from '~/components/common/Button';
import Input from '~/components/common/TextInputField';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const passwordRef = useRef<TextInput>(null);

  const validateInputs = (): boolean => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = (): void => {
    if (!validateInputs()) return;

    setLoading(true);
    setErrors({ email: '', password: '' });
    
    // Your login logic here
    setTimeout(() => {
      setLoading(false);
      console.log('Login:', email, password);
    }, 2000);
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to continue">
      <View>
        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
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
          value={password}
          onChangeText={setPassword}
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
            disabled={!email.trim() || !password.trim()}
          />
        </View>

        <View className="mt-8 items-center">
          <View className="flex-row items-center">
            <Text className="text-craftopia-text-secondary text-base">
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-craftopia-digital text-base font-semibold">
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity className="mt-4" activeOpacity={0.7}>
            <Text className="text-craftopia-spark text-sm">
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthLayout>
  );
};

export default LoginScreen;
// RegisterScreen.tsx
import React, { useState, useRef } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import AuthLayout from '~/components/auth/AuthLayout';
import Button from '~/components/common/Button';
import Input from '~/components/common/TextInputField';

const RegisterScreen: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const validateInputs = (): boolean => {
    const newErrors = { username: '', email: '', password: '', confirmPassword: '' };
    let isValid = true;

    if (!username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
      isValid = false;
    }

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

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = (): void => {
    if (!validateInputs()) return;

    setLoading(true);
    setErrors({ username: '', email: '', password: '', confirmPassword: '' });
    
    // Your registration logic here
    setTimeout(() => {
      setLoading(false);
      console.log('Register:', username, email, password);
    }, 2000);
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join us to start your journey">
      <View>
        <Input
          label="Username"
          placeholder="Enter your username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoComplete="username"
          nextInputRef={emailRef}
          error={errors.username}
        />

        <Input
          ref={emailRef}
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
          nextInputRef={confirmPasswordRef}
          error={errors.password}
        />

        <Input
          ref={confirmPasswordRef}
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
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
            disabled={!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()}
          />
        </View>

        <View className="mt-8 items-center">
          <View className="flex-row items-center">
            <Text className="text-craftopia-text-secondary text-base">
              Already have an account?{' '}
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-craftopia-digital text-base font-semibold">
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity className="mt-4" activeOpacity={0.7}>
            <Text className="text-craftopia-spark text-sm">
              Need Help?
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthLayout>
  );
};

export default RegisterScreen;
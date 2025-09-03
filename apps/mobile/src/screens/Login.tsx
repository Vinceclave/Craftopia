// apps/mobile/src/screens/Login.tsx
import React, { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, Alert, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigations/AuthNavigator';
import { AuthForm, AuthField } from '~/components/auth/AuthForm';
import { useAuth } from '~/context/AuthContext';

type LoginScreenProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface FormValues {
  [key: string]: string;
  email: string;
  password: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

export const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenProp>();
  const { login, isLoading } = useAuth();
  
  const [values, setValues] = useState<FormValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});

  const fields: AuthField[] = [
    { name: 'email', label: 'Email', placeholder: 'Enter your email', keyboardType: 'email-address' },
    { name: 'password', label: 'Password', placeholder: 'Enter your password', secure: true },
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!values.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!values.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (values.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await login(values);
      // Success is handled by the AuthProvider and navigation will happen automatically
    } catch (error: any) {
      const errorMessage = error.message;
      
      // Check if it's an email verification error
      if (errorMessage.includes('verify your email') || errorMessage.includes('email not verified')) {
        Alert.alert(
          'Email Not Verified',
          'Please check your email and click the verification link before logging in.',
          [
            { text: 'Resend Email', onPress: () => handleResendVerification() },
            { text: 'OK', style: 'default' }
          ]
        );
      } else {
        Alert.alert('Login Failed', errorMessage);
      }
    }
  };

  const handleResendVerification = () => {
    Alert.alert(
      'Resend Verification',
      'To resend the verification email, please register again or contact support.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Subtle Background Elements */}
      <View className="absolute inset-0 overflow-hidden">
        <View className="absolute w-80 h-80 rounded-full bg-gray-50 opacity-60 -top-40 -right-40" />
        <View className="absolute w-60 h-60 rounded-full bg-blue-50 opacity-40 -bottom-30 -left-30" />
      </View>

      <View className="flex-1 justify-center px-6 relative z-10">
        {/* Minimal Header */}
        <View className="mb-12">
          <Text className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome back
          </Text>
          <Text className="text-gray-600">
            Sign in to your account
          </Text>
        </View>

        {/* Auth Form */}
        <View className="mb-8">
          <AuthForm 
            fields={fields} 
            values={values} 
            errors={errors}
            onChange={handleChange} 
            onSubmit={handleSubmit} 
            submitTitle="Sign in"
            loading={isLoading}
          />
        </View>

        {/* Sign Up Link */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('Register')} 
          className="mb-8"
          disabled={isLoading}
        >
          <Text className="text-center text-gray-600">
            Don't have an account?{' '}
            <Text className="font-medium text-blue-600">
              Sign up
            </Text>
          </Text>
        </TouchableOpacity>

        {/* Clean Help Section */}
        <View className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-600">
          <Text className="font-medium text-gray-900 mb-1">
            Need help?
          </Text>
          <Text className="text-sm text-gray-600 leading-relaxed">
            Make sure you've verified your email address. Check your inbox for the verification link.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
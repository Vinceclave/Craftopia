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
    <SafeAreaView className="flex-1 bg-white px-6 justify-center">
      <Text className="text-3xl font-bold text-center mb-6">Welcome Back</Text>

      <AuthForm 
        fields={fields} 
        values={values} 
        errors={errors}
        onChange={handleChange} 
        onSubmit={handleSubmit} 
        submitTitle="Login"
        loading={isLoading}
      />

      <TouchableOpacity 
        onPress={() => navigation.navigate('Register')} 
        className="mt-4"
        disabled={isLoading}
      >
        <Text className="text-gray-600 text-center">
          Don't have an account? <Text className="text-blue-600 font-semibold">Sign Up</Text>
        </Text>
      </TouchableOpacity>

      {/* Email verification help */}
      <View className="mt-6 p-4 bg-blue-50 rounded-lg">
        <Text className="text-blue-800 text-sm text-center">
          💡 Can't log in? Make sure you've verified your email address first.
        </Text>
      </View>
    </SafeAreaView>
  );
};
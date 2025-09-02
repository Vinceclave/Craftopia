import React, { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigations/AuthNavigator';
import { AuthForm, AuthField } from '~/components/auth/AuthForm';

type LoginScreenProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenProp>();
  const [values, setValues] = useState({ email: '', password: '' });

  const fields: AuthField[] = [
    { name: 'email', label: 'Email', placeholder: 'Enter your email', keyboardType: 'email-address' },
    { name: 'password', label: 'Password', placeholder: 'Enter your password', secure: true },
  ];

  const handleChange = (name: string, value: string) => setValues(prev => ({ ...prev, [name]: value }));
  const handleSubmit = () => console.log('Login submitted', values);

  return (
    <SafeAreaView className="flex-1 bg-white px-6 justify-center">
      <Text className="text-3xl font-bold text-center mb-6">Welcome Back</Text>

      <AuthForm fields={fields} values={values} onChange={handleChange} onSubmit={handleSubmit} submitTitle="Login" />

      <TouchableOpacity onPress={() => navigation.navigate('Register')} className="mt-4">
        <Text className="text-gray-600 text-center">Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

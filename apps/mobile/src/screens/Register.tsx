import React, { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigations/AuthNavigator';
import { AuthForm, AuthField } from '~/components/auth/AuthForm';

type RegisterScreenProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenProp>();
  const [values, setValues] = useState({ fullName: '', email: '', password: '' });

  const fields: AuthField[] = [
    { name: 'fullName', label: 'Full Name', placeholder: 'Enter your full name' },
    { name: 'email', label: 'Email', placeholder: 'Enter your email', keyboardType: 'email-address' },
    { name: 'password', label: 'Password', placeholder: 'Enter your password', secure: true },
  ];

  const handleChange = (name: string, value: string) => setValues(prev => ({ ...prev, [name]: value }));
  const handleSubmit = () => console.log('Register submitted', values);

  return (
    <SafeAreaView className="flex-1 bg-white px-6 justify-center">
      <Text className="text-3xl font-bold text-center mb-6">Create Account</Text>

      <AuthForm fields={fields} values={values} onChange={handleChange} onSubmit={handleSubmit} submitTitle="Register" />

      <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
        <Text className="text-gray-600 text-center">Already have an account? Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

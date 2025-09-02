import React, { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigations/AuthNavigator';
import { AuthForm, AuthField } from '../components/auth/AuthForm';
import { useAuth } from '../context/AuthContext';

type RegisterScreenProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

interface FormValues {
  [key: string]: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

export const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenProp>();
  const { register, isLoading } = useAuth();

  const [values, setValues] = useState<FormValues>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const fields: AuthField[] = [
    { name: 'username', label: 'Username', placeholder: 'Enter your username' },
    { name: 'email', label: 'Email', placeholder: 'Enter your email', keyboardType: 'email-address' },
    { name: 'password', label: 'Password', placeholder: 'Enter your password', secure: true },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      placeholder: 'Confirm your password',
      secure: true,
    },
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!values.username.trim()) newErrors.username = 'Username is required';
    else if (values.username.length < 3) newErrors.username = 'Username must be at least 3 characters';

    if (!values.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(values.email)) newErrors.email = 'Please enter a valid email';

    if (!values.password.trim()) newErrors.password = 'Password is required';
    else if (values.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (!values.confirmPassword.trim()) newErrors.confirmPassword = 'Please confirm your password';
    else if (values.password !== values.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const { confirmPassword, ...registerData } = values;
      console.log('RegisterScreen: Calling register with data:', registerData);
      await register(registerData);
      console.log('RegisterScreen: Resetting navigation to VerifyEmail with email:', values.email);
      navigation.reset({
        index: 0,
        routes: [{ name: 'VerifyEmail', params: { email: values.email } }],
      });
      console.log('RegisterScreen: Navigation reset complete');
    } catch (error: any) {
      console.error('RegisterScreen: Registration failed:', error);
      Alert.alert('Registration Failed', error.message || 'Something went wrong');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6 justify-center">
      <Text className="text-3xl font-bold text-center mb-6">Create Account</Text>

      <AuthForm
        fields={fields}
        values={values}
        errors={errors}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitTitle="Register"
        loading={isLoading}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate('Login')}
        className="mt-4"
        disabled={isLoading}
      >
        <Text className="text-gray-600 text-center">
          Already have an account? <Text className="text-blue-600 font-semibold">Login</Text>
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
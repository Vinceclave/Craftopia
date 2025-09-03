// apps/mobile/src/screens/Register.tsx
import React, { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, Alert, View } from 'react-native';
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
    <SafeAreaView className="flex-1 justify-center" style={{ backgroundColor: '#F0F0F0' }}>
      {/* Floating Background Shapes */}
      <View className="absolute inset-0 overflow-hidden">
        <View 
          className="absolute -top-32 -right-32 w-64 h-64 rounded-full opacity-4" 
          style={{ backgroundColor: '#7C9885' }} 
        />
        <View 
          className="absolute top-96 -left-24 w-48 h-48 rounded-full opacity-3" 
          style={{ backgroundColor: '#FF6700' }} 
        />
      </View>

      <View className="px-8 relative z-10">
        {/* Header */}
        <View className="items-center mb-12">
          <View className="flex-row items-center mb-4">
            <View 
              className="w-3 h-3 rounded-full mr-4"
              style={{ backgroundColor: '#7C9885' }}
            />
            <Text className="text-lg font-semibold tracking-wider uppercase" style={{ color: '#333333' }}>
              Join EcoCraft
            </Text>
          </View>
          <Text className="text-5xl font-black text-center leading-tight" style={{ color: '#004E98' }}>
            Create Account
          </Text>
          <Text className="text-lg font-medium text-center mt-4" style={{ color: '#333333' }}>
            Start your sustainable crafting journey
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
            submitTitle="Create Account"
            loading={isLoading}
          />
        </View>

        {/* Login Link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          className="mb-8"
          disabled={isLoading}
        >
          <Text className="text-center text-base font-medium" style={{ color: '#333333' }}>
            Already have an account?{' '}
            <Text className="font-bold" style={{ color: '#00A896' }}>
              Sign In
            </Text>
          </Text>
        </TouchableOpacity>

        {/* Terms & Privacy Notice */}
        <View 
          className="p-6 rounded-2xl relative overflow-hidden"
          style={{ 
            backgroundColor: '#7C988515',
            borderWidth: 1,
            borderColor: '#7C988525'
          }}
        >
          <View 
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: '#7C9885' }}
          />
          <View className="flex-row items-start">
            <View 
              className="w-10 h-10 rounded-xl items-center justify-center mr-4"
              style={{ backgroundColor: '#7C988520' }}
            >
              <Text className="text-lg">🌱</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-base mb-2" style={{ color: '#004E98' }}>
                Welcome to our eco-community!
              </Text>
              <Text className="font-medium leading-relaxed" style={{ color: '#333333' }}>
                By creating an account, you agree to our Terms of Service and Privacy Policy. Let's build a sustainable future together!
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
// apps/mobile/src/screens/auth/ResetPassword.tsx - NEW SCREEN
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Lock, CheckCircle } from 'lucide-react-native';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '~/components/common/Button';
import { Input } from '~/components/common/TextInputField';
import { AuthStackParamList } from '~/navigations/AuthNavigator';
import { authService } from '~/services/auth.service';
import { useAlert } from '~/hooks/useAlert';

type ResetPasswordNavProp = NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>;
type ResetPasswordRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;

const ResetPassword = () => {
  const navigation = useNavigation<ResetPasswordNavProp>();
  const route = useRoute<ResetPasswordRouteProp>();
  const { success, error: showError } = useAlert();

  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Get token from route params or query
  useEffect(() => {
    const tokenFromRoute = route.params?.token;
    if (tokenFromRoute) {
      setToken(tokenFromRoute);
    }
  }, [route.params]);

  // Validate password
  const validatePassword = (value: string): boolean => {
    setPasswordError('');
    
    if (!value.trim()) {
      setPasswordError('Password is required');
      return false;
    }
    
    if (value.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    
    return true;
  };

  // Validate confirm password
  const validateConfirmPassword = (value: string): boolean => {
    setConfirmPasswordError('');
    
    if (!value.trim()) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    
    if (value !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  // Handle password change
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) {
      validatePassword(value);
    }
    // Re-validate confirm password if it's already filled
    if (confirmPassword) {
      validateConfirmPassword(confirmPassword);
    }
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (confirmPasswordError) {
      validateConfirmPassword(value);
    }
  };

  // Handle password reset
  const handleResetPassword = async () => {
    // Validate all fields
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    if (!token) {
      showError('Invalid Token', 'Reset token is missing or invalid');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token, password);
      console.log('✅ Password reset successful');
      
      setIsSuccess(true);
      
      // Show success message
      success(
        'Password Reset Successful! 🎉',
        'Your password has been changed successfully. You can now log in with your new password.',
        () => {
          navigation.navigate('Login');
        }
      );
    } catch (err: any) {
      console.error('❌ Password reset failed:', err);
      showError(
        'Reset Failed',
        err.message || 'Failed to reset password. The link may have expired.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // If success, show success screen
  if (isSuccess) {
    return (
      <SafeAreaView className="flex-1 bg-craftopia-background">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="px-6"
        >
          <View className="flex-1 justify-center items-center py-8">
            <View className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-6">
              <CheckCircle size={48} color="#10B981" strokeWidth={2} />
            </View>
            
            <Text className="text-2xl font-bold text-craftopia-textPrimary text-center mb-2 font-poppinsBold">
              Password Reset Complete!
            </Text>
            
            <Text className="text-craftopia-textSecondary text-center mb-8 font-nunito">
              Your password has been successfully changed
            </Text>
            
            <Button
              title="Go to Login"
              onPress={() => navigation.navigate('Login')}
              className="w-full"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show reset password form
  return (
    <SafeAreaView className="flex-1 bg-craftopia-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="px-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center py-8">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-full bg-purple-100 items-center justify-center mb-4">
              <Lock size={40} color="#6D28D9" strokeWidth={2} />
            </View>
            <Text className="text-2xl font-bold text-craftopia-textPrimary text-center mt-4 mb-2 font-poppinsBold">
              Create New Password
            </Text>
            <Text className="text-craftopia-textSecondary text-center text-sm font-nunito">
              Enter your new password below
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <Input
              label="New Password"
              placeholder="Enter new password"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry
              error={passwordError}
              leftIcon={<Lock size={20} color="#6B7280" />}
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              secureTextEntry
              error={confirmPasswordError}
              leftIcon={<Lock size={20} color="#6B7280" />}
            />

            {/* Password Requirements */}
            <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <Text className="text-craftopia-textPrimary text-sm font-semibold mb-2 font-poppinsBold">
                Password Requirements:
              </Text>
              <Text className="text-craftopia-textSecondary text-xs leading-relaxed font-nunito">
                • At least 8 characters long{'\n'}
                • Should be unique and not easily guessable{'\n'}
                • Consider using a mix of letters, numbers, and symbols
              </Text>
            </View>

            {/* Reset Button */}
            <Button
              title="Reset Password"
              onPress={handleResetPassword}
              loading={isLoading}
              disabled={isLoading || !password || !confirmPassword}
              className="mt-2"
            />

            {/* Cancel */}
            <Button
              title="Cancel"
              onPress={() => navigation.navigate('Login')}
              variant="ghost"
              disabled={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ResetPassword;
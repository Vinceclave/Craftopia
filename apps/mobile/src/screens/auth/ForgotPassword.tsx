// apps/mobile/src/screens/auth/ForgotPassword.tsx - IMPROVED VERSION
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Mail, Lock } from 'lucide-react-native';
import { TouchableOpacity, View, Text, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '~/components/common/Button';
import { Input } from '~/components/common/TextInputField';
import AuthLayout from '~/components/auth/AuthLayout';
import { AuthStackParamList } from '~/navigations/AuthNavigator';
import { authService } from '~/services/auth.service';
import { useAlert } from '~/hooks/useAlert';

type ForgotPasswordNavProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPassword = () => {
  const navigation = useNavigation<ForgotPasswordNavProp>();
  const { success, error: showError } = useAlert();

  const [step, setStep] = useState<'email' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validate email
  const validateEmail = (value: string): boolean => {
    setEmailError('');

    if (!value.trim()) {
      setEmailError('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  // Handle email submission
  const handleSendResetEmail = async () => {
    if (!validateEmail(email)) return;

    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(email.trim());

      // Move to success step
      setStep('success');
    } catch (err: any) {
      console.error('❌ Failed to send reset email:', err);
      showError(
        'Failed to Send Email',
        err.message || 'Could not send password reset email. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email input change
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      validateEmail(value);
    }
  };

  // Open Gmail app (inbox, not compose)
  const handleOpenEmail = () => {
    Linking.openURL('googlegmail://');
  };

  // Render email input step
  if (step === 'email') {
    return (
      <AuthLayout
        title="Forgot Password"
        subtitle="Enter your email address and we'll send you instructions to reset your password"
      >
        {/* Back Button */}
        <View className="absolute left-4 top-4 z-10">
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            className="flex-row items-center"
          >
            <ArrowLeft size={22} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Email Input */}
        <View className="mt-6">
          <Input
            label="Email Address"
            placeholder="youremail@gmail.com"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={emailError}
            leftIcon={<Mail size={20} color="#6B7280" />}
          />
        </View>

        {/* Send Button */}
        <View className="mt-6">
          <Button
            title="Send Reset Instructions"
            onPress={handleSendResetEmail}
            loading={isLoading}
            disabled={isLoading || !email.trim()}
          />
        </View>

        {/* Back to Login */}
        <View className="mt-4">
          <Button
            title="Back to Login"
            onPress={() => navigation.navigate('Login')}
            variant="outline"
            disabled={isLoading}
          />
        </View>
      </AuthLayout>
    );
  }

  // Render success step
  return (
    <SafeAreaView className="flex-1 bg-craftopia-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="px-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center py-8">
          {/* Icon */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-full bg-purple-100 items-center justify-center mb-4">
              <Mail size={40} color="#6D28D9" strokeWidth={2} />
            </View>
            <Text className="text-2xl font-bold text-craftopia-textPrimary text-center mt-4 mb-2 font-poppinsBold">
              Check Your Email
            </Text>
            <Text className="text-craftopia-textSecondary text-center text-sm font-nunito">
              We've sent password reset instructions to your email
            </Text>
          </View>

          {/* Info Card */}
          <View className="bg-craftopia-surface rounded-xl p-5 border border-craftopia-light mb-6">
            <Text className="text-craftopia-textPrimary text-lg font-semibold mb-3 text-center font-poppinsBold">
              What's Next?
            </Text>

            <Text className="text-craftopia-textSecondary text-base leading-relaxed mb-4 font-nunito">
              We sent an email to:{'\n'}
              <Text className="font-semibold text-purple-600">{email}</Text>
            </Text>

            <View className="space-y-3">
              <View className="flex-row items-start">
                <Text className="text-purple-600 font-bold mr-2 font-poppinsBold">1.</Text>
                <Text className="flex-1 text-craftopia-textSecondary font-nunito">
                  Check your inbox for the password reset email
                </Text>
              </View>

              <View className="flex-row items-start">
                <Text className="text-purple-600 font-bold mr-2 font-poppinsBold">2.</Text>
                <Text className="flex-1 text-craftopia-textSecondary font-nunito">
                  Click the "Reset Password" button in the email
                </Text>
              </View>

              <View className="flex-row items-start">
                <Text className="text-purple-600 font-bold mr-2 font-poppinsBold">3.</Text>
                <Text className="flex-1 text-craftopia-textSecondary font-nunito">
                  Enter your new password when prompted
                </Text>
              </View>
            </View>

            <View className="mt-6">
              <Button
                title="Open Email App"
                onPress={handleOpenEmail}
                variant="outline"
                size="md"
              />
            </View>
          </View>

          {/* Help Section */}
          <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <Text className="text-craftopia-textPrimary text-sm font-semibold mb-2 font-poppinsBold">
              Didn't receive the email?
            </Text>
            <Text className="text-craftopia-textSecondary text-xs leading-relaxed font-nunito">
              • Check your spam/junk folder{'\n'}
              • Make sure you entered the correct email{'\n'}
              • Wait a few minutes for the email to arrive{'\n'}
              • The reset link expires in 24 hours
            </Text>
          </View>

          {/* Actions */}
          <View className="space-y-3">
            <Button
              title="Try Another Email"
              onPress={() => {
                setStep('email');
                setEmail('');
                setEmailError('');
              }}
              variant="outline"
            />

            <Button
              title="Back to Login"
              onPress={() => navigation.navigate('Login')}
              variant="ghost"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForgotPassword;
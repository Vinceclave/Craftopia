import { MailOpen } from 'lucide-react-native';
import React, { useState } from 'react';
import { Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '~/navigations/AuthNavigator';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Input } from '~/components/common/TextInputField';
import Button from '~/components/common/Button';
import { useVerifyEmail, useResendVerification } from '~/hooks/useAuth';
import { useAlert } from '~/hooks/useAlert';

type VerifyEmailScreenProp = NativeStackNavigationProp<AuthStackParamList, 'VerifyEmail'>;
type VerifyEmailRouteProp = RouteProp<AuthStackParamList, 'VerifyEmail'>;

export const VerifyEmailScreen = () => {
  const navigation = useNavigation<VerifyEmailScreenProp>();
  const route = useRoute<VerifyEmailRouteProp>();
  const { alert, success, error } = useAlert();

  const [email, setEmail] = useState(route.params?.email || '');
  const [token, setToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(!!route.params?.email);

  // TanStack Query mutations
  const verifyEmailMutation = useVerifyEmail();
  const resendVerificationMutation = useResendVerification();

  const handleVerifyToken = async () => {
    if (!token.trim()) {
      error('Error', 'Please enter the verification token from your email');
      return;
    }

    try {
      await verifyEmailMutation.mutateAsync(token.trim());
      
      success('Email Verified! ✅', 'Redirecting you to login...', () => {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      });
    } catch (err: any) {
      error('Verification Failed', err.message || 'Invalid or expired token.');
    }
  };

  const handleResendVerification = async () => {
    if (!email?.trim()) {
      error('Error', 'No email address found. Please go back and register again.');
      return;
    }

    try {
      await resendVerificationMutation.mutateAsync(email.trim());
      
      success(
        'Verification Email Sent! 📧',
        'A new verification email has been sent to your inbox. Please check your email and enter the verification token below.',
        () => setShowTokenInput(true)
      );
    } catch (err: any) {
      error('Failed to Send Email', err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-craftopia-light">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="px-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center">
          <View className="items-center mb-4">
            <MailOpen size={64} color="#4A90E2" strokeWidth={2.5} />
            <Text className="text-xl font-black text-craftopia-text-primary text-center mt-4 mb-3">
              Verify your email
            </Text>
          </View>

          {showTokenInput ? (
            <>
              <Text className="text-craftopia-text-secondary text-center text-base leading-relaxed mb-4">
                We sent a verification email to{'\n'}
                <Text className="font-semibold text-craftopia-accent">{email}</Text>
              </Text>

              <View className="bg-craftopia-surface p-5 rounded-2xl mb-6 border border-craftopia-accent">
                <Text className="text-craftopia-accent text-sm font-semibold mb-3">
                  How to verify:
                </Text>
                <Text className="text-craftopia-text-secondary text-sm leading-relaxed">
                  1. Check your email inbox (and spam folder){'\n'}
                  2. Open the verification email from Craftopia{'\n'}
                  3. Tap the link OR copy the token below
                </Text>
              </View>

              <Input
                label="Verification Token"
                placeholder="Paste verification token"
                value={token}
                onChangeText={setToken}
                autoCapitalize="none"
                isLastInput
              />

              <View className="mt-6">
                <Button
                  title="Verify Email"
                  onPress={handleVerifyToken}
                  loading={verifyEmailMutation.isPending}
                  disabled={!token.trim() || verifyEmailMutation.isPending}
                  variant="primary"
                />
              </View>

              <View className="mt-4">
                <Button
                  title="Resend Verification Email"
                  onPress={handleResendVerification}
                  loading={resendVerificationMutation.isPending}
                  disabled={resendVerificationMutation.isPending}
                  variant="outline"
                />
              </View>
            </>
          ) : (
            <>
              <Text className="text-craftopia-text-secondary text-center text-base mb-4">
                Didn't get the verification email? Enter your email to request another link.
              </Text>

              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                isLastInput
              />

              <View className="mt-6">
                <Button
                  title="Send Verification Email"
                  onPress={handleResendVerification}
                  loading={resendVerificationMutation.isPending}
                  disabled={!email.trim() || resendVerificationMutation.isPending}
                  variant="primary"
                />
              </View>
            </>
          )}

          <View className="mt-8">
            <Button
              title="Back to Login"
              onPress={() => navigation.navigate('Login')}
              variant="outline"
              disabled={verifyEmailMutation.isPending || resendVerificationMutation.isPending}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
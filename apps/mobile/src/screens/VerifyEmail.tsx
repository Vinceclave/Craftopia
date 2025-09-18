import { MailOpen } from 'lucide-react-native'
import React, { useState } from 'react'
import { Text, View, Alert, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigations/AuthNavigator';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Input from '~/components/common/TextInputField'
import Button from '~/components/common/Button'
import { authService } from '../services/auth.service';

type VerifyEmailScreenProp = NativeStackNavigationProp<AuthStackParamList, 'VerifyEmail'>;
type VerifyEmailRouteProp = RouteProp<AuthStackParamList, 'VerifyEmail'>;

export const VerifyEmailScreen = () => {
  const navigation = useNavigation<VerifyEmailScreenProp>();
  const route = useRoute<VerifyEmailRouteProp>();

  const [email, setEmail] = useState(route.params?.email || '');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // ✅ Explicit control for flow
  const [showTokenInput, setShowTokenInput] = useState(!!route.params?.email);

  const handleVerifyToken = async () => {
    if (!token.trim()) {
      Alert.alert('Error', 'Please enter the verification token from your email');
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyEmail(token.trim());

      Alert.alert('Email Verified! ✅', 'Redirecting you to login...');

      // ✅ Auto redirect (clear stack so they can't go back to Verify screen)
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error: any) {
      Alert.alert(
        'Verification Failed',
        error.message || 'The verification token is invalid or has expired. Please try again or request a new verification email.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email?.trim()) {
      Alert.alert('Error', 'No email address found. Please go back and register again.');
      return;
    }

    setIsResending(true);
    try {
      await authService.requestEmailVerification(email.trim());

      Alert.alert(
        'Verification Email Sent! 📧',
        'A new verification email has been sent to your inbox. Please check your email and enter the verification token below.',
        [{ text: 'OK', onPress: () => setShowTokenInput(true) }]
      );
    } catch (error: any) {
      Alert.alert(
        'Failed to Resend',
        error.message || 'Something went wrong while sending the verification email.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsResending(false);
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
            // ✅ Token input flow
            <>
              <Text className="text-craftopia-text-secondary text-center text-base leading-relaxed">
                We sent a verification email to{'\n'}
                <Text className="font-semibold text-craftopia-digital">{email}</Text>
              </Text>

              <View className="bg-craftopia-surface p-5 rounded-2xl mb-6 border border-craftopia-accent">
                <Text className="text-craftopia-digital text-sm font-semibold mb-3">
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
                <Button title="Verify Email" onPress={handleVerifyToken} loading={isLoading} />
              </View>
            </>
          ) : (
            // ❌ Email input + resend button
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
                  title="Resend Verification Link"
                  onPress={handleResendVerification}
                  loading={isResending}
                />
              </View>
            </>
          )}

          <View className="mt-8">
            <Button
              title="Back to Login"
              onPress={() => navigation.navigate('Login')}
              variant="outline"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

import { MailOpen } from 'lucide-react-native';
import React, { useState } from 'react';
import { Text, View, ScrollView, Linking } from 'react-native';
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

  const verifyEmailMutation = useVerifyEmail();
  const resendVerificationMutation = useResendVerification();

  const handleVerifyToken = async () => {
    if (!token.trim()) {
      error('Error', 'Please enter the verification token from your email');
      return;
    }

    try {
      await verifyEmailMutation.mutateAsync(token.trim());
      
      success(
        'Email Verified! ✅', 
        'Your email has been successfully verified. You can now log in to your account.',
        () => {
          navigation.reset({ 
            index: 0, 
            routes: [{ name: 'Login' }] 
          });
        }
      );
    } catch (err: any) {
      console.error('Email verification failed:', err);
      error(
        'Verification Failed', 
        err.message || 'The verification token is invalid or has expired. Please request a new one.'
      );
    }
  };

  const handleResendVerification = async () => {
    if (!email?.trim()) {
      error('Error', 'Please enter your email address to resend verification.');
      return;
    }

    try {
      await resendVerificationMutation.mutateAsync(email.trim());
      
      success(
        'Verification Email Sent! 📧',
        'A new verification email has been sent to your inbox. Please check your email and click the verification link or copy the token.',
        () => setShowTokenInput(true)
      );
    } catch (err: any) {
      console.error('Resend verification failed:', err);
      error(
        'Failed to Send Email', 
        err.message || 'Could not send verification email. Please try again later.'
      );
    }
  };

  const handleOpenEmail = () => {
    // Open default email app
    Linking.openURL('mailto:');
  };

  return (
    <SafeAreaView className="flex-1 bg-craftopia-light">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="px-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center">
          <View className="items-center mb-6">
            <MailOpen size={64} color="#004E98" strokeWidth={2} />
            <Text className="text-2xl font-bold text-craftopia-textPrimary text-center mt-4 mb-2">
              Verify Your Email
            </Text>
            <Text className="text-craftopia-textSecondary text-center text-sm">
              We need to verify your email address to complete your registration
            </Text>
          </View>

          {showTokenInput ? (
            <>
              <Text className="text-craftopia-textSecondary text-center text-base leading-relaxed mb-6">
                We sent a verification email to{'\n'}
                <Text className="font-semibold text-craftopia-primary">{email}</Text>
              </Text>

              <View className="bg-craftopia-surface p-4 rounded-xl mb-6 border border-craftopia-light">
                <Text className="text-craftopia-primary text-sm font-semibold mb-2">
                  📧 Check Your Email
                </Text>
                <Text className="text-craftopia-textSecondary text-sm leading-relaxed mb-3">
                  • Look for an email from Craftopia{'\n'}
                  • Click the verification link in the email{'\n'}
                  • Or copy the verification token and paste it below
                </Text>
                <Button
                  title="Open Email App"
                  onPress={handleOpenEmail}
                  variant="outline"
                  size="sm"
                />
              </View>

              <Input
                label="Verification Token (Optional)"
                placeholder="Paste token from email"
                value={token}
                onChangeText={setToken}
                autoCapitalize="none"
                isLastInput
                onSubmit={handleVerifyToken}
              />

              <View className="mt-6 space-y-3">
                {token.trim() && (
                  <Button
                    title="Verify Email"
                    onPress={handleVerifyToken}
                    loading={verifyEmailMutation.isPending}
                    disabled={!token.trim() || verifyEmailMutation.isPending}
                    variant="primary"
                  />
                )}

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
              <Text className="text-craftopia-textSecondary text-center text-base mb-6">
                Enter your email address to receive a verification link
              </Text>

              <Input
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                isLastInput
                onSubmit={handleResendVerification}
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

          {/* Help Section */}
          <View className="mt-6 p-4 bg-craftopia-surface rounded-xl border border-craftopia-light">
            <Text className="text-craftopia-textPrimary text-sm font-semibold mb-2">
              Need Help?
            </Text>
            <Text className="text-craftopia-textSecondary text-xs leading-relaxed">
              • Check your spam/junk folder{'\n'}
              • Make sure you entered the correct email{'\n'}
              • Wait a few minutes for the email to arrive{'\n'}
              • Try resending if you don't receive it
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
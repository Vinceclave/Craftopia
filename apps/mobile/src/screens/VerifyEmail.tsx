import { MailOpen } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '~/navigations/AuthNavigator';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Button from '~/components/common/Button';
import { useVerifyEmail, useResendVerification } from '~/hooks/useAuth';
import { useAlert } from '~/hooks/useAlert';

type VerifyEmailScreenProp = NativeStackNavigationProp<AuthStackParamList, 'VerifyEmail'>;
type VerifyEmailRouteProp = RouteProp<AuthStackParamList, 'VerifyEmail'>;

export const VerifyEmailScreen = () => {
  const navigation = useNavigation<VerifyEmailScreenProp>();
  const route = useRoute<VerifyEmailRouteProp>();
  const { success, error } = useAlert();

  const [email, setEmail] = useState(route.params?.email || '');
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyEmailMutation = useVerifyEmail();
  const resendVerificationMutation = useResendVerification();

  // Auto-verify if token is present (from deep link)
  useEffect(() => {
    const token = route.params?.token;
    const autoVerify = route.params?.autoVerify;

    if (token && autoVerify && !isVerifying) {
      handleAutoVerify(token);
    }
  }, [route.params?.token, route.params?.autoVerify]);

  const handleAutoVerify = async (token: string) => {
    setIsVerifying(true);
    try {

      await verifyEmailMutation.mutateAsync(token);

      success(
        'Email Verified! 🎉',
        'Your email has been successfully verified. You can now sign in to your account.',
        () => {
          navigation.navigate('Login');
        }
      );
    } catch (err: any) {
      console.error('❌ [VerifyEmail] Auto-verification failed:', err);

      if (err.message?.toLowerCase().includes('already verified')) {
        success(
          'Already Verified',
          'Your email was already verified. You can sign in now.',
          () => {
            navigation.navigate('Login');
          }
        );
      } else {
        error(
          'Verification Failed',
          err.message || 'Failed to verify email. The link may have expired.'
        );
      }
    } finally {
      setIsVerifying(false);
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
        'A new verification email has been sent to your inbox. Please check your email and click the verification link.',
      );
    } catch (err: any) {
      console.error('❌ [VerifyEmail] Resend failed:', err);
      error(
        'Failed to Send Email',
        err.message || 'Could not send verification email. Please try again later.'
      );
    }
  };

  // Open Gmail app (inbox, not compose)
  const handleOpenEmail = () => {
    Linking.openURL('googlegmail://');
  };

  // Show loading state during auto-verification
  if (isVerifying) {
    return (
      <SafeAreaView className="flex-1 bg-craftopia-background">
        <View className="flex-1 justify-center items-center px-6">
          <ActivityIndicator size="large" color="#3B6E4D" />
          <Text className="text-craftopia-textPrimary text-lg font-poppinsBold mt-4">
            Verifying your email...
          </Text>
          <Text className="text-craftopia-textSecondary text-sm font-nunito mt-2 text-center">
            Please wait while we verify your email address
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-craftopia-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="px-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center py-8">
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-full bg-craftopia-primary/10 items-center justify-center mb-4">
              <MailOpen size={40} color="#3B6E4D" strokeWidth={2} />
            </View>
            <Text className="text-2xl font-bold text-craftopia-textPrimary text-center mt-4 mb-2 font-poppinsBold">
              Verify Your Email
            </Text>
            <Text className="text-craftopia-textSecondary text-center text-sm font-nunito">
              We need to verify your email address to complete your registration
            </Text>
          </View>

          <View className="bg-craftopia-surface rounded-xl p-5 border border-craftopia-light mb-6">
            <Text className="text-craftopia-textPrimary text-lg font-semibold mb-3 text-center font-poppinsBold">
              Check Your Email
            </Text>

            {email && (
              <Text className="text-craftopia-textSecondary text-base leading-relaxed mb-4 font-nunito">
                We sent a verification email to:{'\n'}
                <Text className="font-semibold text-craftopia-primary">{email}</Text>
              </Text>
            )}

            <Text className="text-craftopia-textSecondary text-sm leading-relaxed mb-4 font-nunito">
              Please check your inbox and click the verification link in the email to activate your account.
            </Text>

            <Button
              title="Open Email App"
              onPress={handleOpenEmail}
              variant="outline"
              size="md"
              className="mb-4"
            />

            <Button
              title="Resend Verification Email"
              onPress={handleResendVerification}
              loading={resendVerificationMutation.isPending}
              disabled={resendVerificationMutation.isPending || !email}
              variant="primary"
            />
          </View>

          {/* Help Section */}
          <View className="bg-craftopia-light rounded-xl p-4 border border-craftopia-light">
            <Text className="text-craftopia-textPrimary text-sm font-semibold mb-2 font-poppinsBold">
              Need Help?
            </Text>
            <Text className="text-craftopia-textSecondary text-xs leading-relaxed font-nunito">
              • Check your spam/junk folder{'\n'}
              • Make sure you entered the correct email{'\n'}
              • Wait a few minutes for the email to arrive{'\n'}
              • Try resending if you don't receive it
            </Text>
          </View>

          <View className="mt-8">
            <Button
              title="Back to Login"
              onPress={() => navigation.navigate('Login')}
              variant="outline"
              disabled={resendVerificationMutation.isPending || isVerifying}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
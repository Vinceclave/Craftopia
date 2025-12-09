// apps/mobile/src/hooks/useDeepLink.ts
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '~/navigations/AuthNavigator';

type DeepLinkNavigation = NativeStackNavigationProp<AuthStackParamList>;

interface DeepLinkParams {
  screen?: keyof AuthStackParamList;
  params?: any;
}

export const useDeepLink = () => {
  const navigation = useNavigation<DeepLinkNavigation>();

  useEffect(() => {
    // Handle initial URL when app is opened from a deep link
    const handleInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          handleDeepLink(initialUrl);
        }
      } catch (error) {
        console.error('❌ [DeepLink] Error getting initial URL:', error);
      }
    };

    // Handle URL when app is already open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    handleInitialURL();

    return () => {
      subscription.remove();
    };
  }, [navigation]);

  const handleDeepLink = (url: string) => {
    try {
      
      const { screen, params } = parseDeepLink(url);
      
      if (screen) {
        // Use type assertion to bypass TypeScript navigation type checking
        (navigation as any).navigate(screen, params);
      } 
    } catch (error) {
      throw error
    }
  };

  const parseDeepLink = (url: string): DeepLinkParams => {
    // Handle both custom scheme (craftopia://) and https:// URLs
    
    // Custom scheme: craftopia://auth/verify-email?token=xyz
    // HTTPS: https://yourdomain.com/auth/verify-email?token=xyz
    
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const searchParams = urlObj.searchParams;

    // Email Verification
    if (path.includes('/auth/verify-email') || path.includes('/verify-email')) {
      const token = searchParams.get('token');
      if (token) {
        return {
          screen: 'VerifyEmail',
          params: { token, autoVerify: true }
        };
      }
    }

    // Password Reset
    if (path.includes('/auth/reset-password') || path.includes('/reset-password')) {
      const token = searchParams.get('token');
      if (token) {
        return {
          screen: 'ResetPassword',
          params: { token }
        };
      }
    }

    return {};
  };

  return { handleDeepLink };
};
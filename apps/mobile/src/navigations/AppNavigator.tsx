import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { LoadingScreen } from '~/components/common/LoadingScreen';
import { OnboardingScreen } from '~/screens/Onboarding';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDeepLink } from '~/hooks/useDeepLink';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // ✅ Initialize deep link handler
  useDeepLink();

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding) setShowOnboarding(true);
      } catch (err) {
        throw err        
      } finally {
        setCheckingOnboarding(false);
      }
    };
    checkOnboarding();
  }, []);

  const handleFinishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setShowOnboarding(false);
    } catch (err) {
      throw err;
    }
  };

  if (checkingOnboarding || isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showOnboarding ? (
          <Stack.Screen name="Onboarding">
            {(props) => <OnboardingScreen {...props} onFinish={handleFinishOnboarding} />}
          </Stack.Screen>
        ) : isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>

      {/* ✅ Global Network Error Overlay - Blocks all navigation when offline */}
    </>
  );
};
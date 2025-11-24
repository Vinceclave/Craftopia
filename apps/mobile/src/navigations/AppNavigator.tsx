// apps/mobile/src/navigation/AppNavigator.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { LoadingScreen } from '~/components/common/LoadingScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDeepLink } from '~/hooks/useDeepLink';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  useDeepLink();

  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

// apps/mobile/src/navigations/AppNavigator.tsx
import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import MainNavigator from './MainNavigator';

export const AppNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log('AppNavigator state:', { isAuthenticated, isLoading, hasUser: !!user });

  // Show loading spinner while checking authentication status or loading user data
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-craftopia-light">
        <ActivityIndicator size="large" color="#004E98" />
        <Text className="text-craftopia-textSecondary mt-2 text-sm">
          {isAuthenticated ? 'Loading your profile...' : 'Checking authentication...'}
        </Text>
      </View>
    );
  }

  // Navigate based on authentication status
  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
};
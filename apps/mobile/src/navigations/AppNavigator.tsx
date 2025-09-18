// apps/mobile/src/navigations/AppNavigator.tsx
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import MainNavigator from './MainNavigator';

export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  console.log(isAuthenticated)
  // Show loading spinner while checking authentication status
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-craftopia-light">
        <ActivityIndicator size="large" color="#004E98" />
      </View>
    );
  }

  // Navigate based on authentication status
  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
};
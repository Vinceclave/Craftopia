import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import MainNavigator from './MainNavigator';

export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('AppNavigator: isLoading=', isLoading, 'isAuthenticated=', isAuthenticated);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
};
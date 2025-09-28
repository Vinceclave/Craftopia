// apps/mobile/App.tsx
import 'react-native-gesture-handler'; // Must be at the very top!
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryProvider } from '~/providers/QueryProvider';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigations/AppNavigator';
import { ModalProvider } from '~/context/modalContext';

// Remove this line - not needed for React Native
import './global.css';

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <ModalProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </ModalProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
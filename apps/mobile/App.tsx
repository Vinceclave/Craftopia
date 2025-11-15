import 'react-native-gesture-handler';
import React, { useEffect, useCallback, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

import { QueryProvider } from '~/providers/QueryProvider';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigations/AppNavigator';
import { ModalProvider } from '~/context/modalContext';
import { WebSocketProvider } from './src/context/WebSocketContext';

import './global.css';

// Keep splash visible on load
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load fonts at startup
  useEffect(() => {
    async function loadResources() {
      try {
        await Font.loadAsync({
          Nunito: require('./assets/fonts/Nunito-VariableFont_wght.ttf'),
          'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
        });

        setFontsLoaded(true);
      } catch (e) {
        console.warn(e);
      }
    }

    loadResources();
  }, []);

  // Hide splash when fonts are ready
  useEffect(() => {
    async function hideSplash() {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    }

    hideSplash();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Keep splash screen visible
  }

  return (
    <QueryProvider>
      <AuthProvider>
        <WebSocketProvider>
          <ModalProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </ModalProvider>
        </WebSocketProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

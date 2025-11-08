import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppLoading from 'expo-app-loading';
import * as Font from 'expo-font';

import { QueryProvider } from '~/providers/QueryProvider';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigations/AppNavigator';
import { ModalProvider } from '~/context/modalContext';
import { WebSocketProvider } from './src/context/WebSocketContext';

import './global.css'

const fetchFonts = () => {
  return Font.loadAsync({
    Nunito: require('./assets/fonts/Nunito-VariableFont_wght.ttf'),
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
  });
};

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  if (!fontsLoaded) {
    return (
      <AppLoading
        startAsync={fetchFonts}
        onFinish={() => setFontsLoaded(true)}
        onError={console.warn}
      />
    );
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

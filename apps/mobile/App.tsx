import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useFonts } from 'expo-font';
import './global.css';

import { AuthProvider, AuthContext } from 'contexts/AuthContext';
import RootNavigator from './RootNavigator';


export default function App() {
  const [fontsLoaded] = useFonts({
    'LuckiestGuy': require('./assets/fonts/LuckiestGuy-Regular.ttf'),
    'OpenSans': require('./assets/fonts/OpenSans-VariableFont_wdth,wght.ttf'),
});

  if (!fontsLoaded) {
    return (
      <View className='flex-1 justify-center items-center'>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
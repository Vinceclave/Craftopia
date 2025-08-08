import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';

import AuthNavigator from './auth/AuthNavigator';
import BottomNavigation from './components/navigation/AppNavigator';
import './global.css'; // Your styles

// Global layout wrapper applying safe area insets once
function SafeAreaLayout({ children }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF3E0', // your global background color (cream)
  },
});

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [fontsLoaded] = useFonts({
    'LuckiestGuy': require('./assets/fonts/LuckiestGuy-Regular.ttf'),
    'OpenSans': require('./assets/fonts/OpenSans-VariableFont_wdth,wght.ttf'),
    // Add other font variants as needed
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF3E0' }}>
        <ActivityIndicator size="large" color="#2B4A2F" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaLayout>
        <NavigationContainer>
          {isAuthenticated ? <BottomNavigation /> : <AuthNavigator />}
        </NavigationContainer>
      </SafeAreaLayout>
    </SafeAreaProvider>
  );
}

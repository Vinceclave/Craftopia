import 'react-native-gesture-handler';
import React, { useEffect, useCallback, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Alert, AppState, AppStateStatus } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import * as Updates from 'expo-updates';

import { QueryProvider } from '~/providers/QueryProvider';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigations/AppNavigator';
import { ModalProvider } from '~/context/modalContext';
import { WebSocketProvider } from './src/context/WebSocketContext';

import './global.css';

// Keep splash visible on load
SplashScreen.preventAutoHideAsync();

// ✅ UPDATE CONFIGURATION
const UPDATE_CONFIG = {
  // Strategy: 'automatic' | 'manual' | 'silent'
  strategy: 'automatic' as 'automatic' | 'manual' | 'silent',
  
  // Check for updates when app returns from background
  checkOnResume: true,
  
  // Minimum time between update checks (in milliseconds)
  checkInterval: 60000, // 1 minute
};

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [lastUpdateCheck, setLastUpdateCheck] = useState<number>(0);

  // ✅ Load fonts at startup
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

  // ✅ ADVANCED: Check for updates with different strategies
  const checkForUpdates = useCallback(async (showNoUpdateAlert = false) => {
    // Skip in development
    if (__DEV__) {
      console.log('🔧 Development mode - skipping update check');
      return;
    }

    // Throttle update checks
    const now = Date.now();
    if (now - lastUpdateCheck < UPDATE_CONFIG.checkInterval) {
      console.log('⏭️ Skipping update check (throttled)');
      return;
    }

    try {
      console.log('🔍 Checking for OTA updates...');
      setLastUpdateCheck(now);
      
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        console.log('📦 Update available! Downloading...');
        
        await Updates.fetchUpdateAsync();
        
        console.log('✅ Update downloaded successfully');
        
        // Handle different update strategies
        switch (UPDATE_CONFIG.strategy) {
          case 'automatic':
            // Show alert and restart immediately
            Alert.alert(
              '🎉 Update Available',
              'A new version has been downloaded. Restart now to apply the latest improvements.',
              [
                {
                  text: 'Later',
                  style: 'cancel',
                  onPress: () => console.log('User postponed update')
                },
                {
                  text: 'Restart Now',
                  onPress: async () => {
                    console.log('🔄 Restarting app to apply update...');
                    await Updates.reloadAsync();
                  }
                }
              ]
            );
            break;

          case 'manual':
            // Just notify, don't auto-restart
            Alert.alert(
              '📲 Update Ready',
              'A new version is ready. You can apply it from Settings.',
              [{ text: 'OK' }]
            );
            break;

          case 'silent':
            // Download silently, apply on next natural restart
            console.log('🤫 Update downloaded silently, will apply on next restart');
            break;
        }
      } else {
        console.log('✅ App is up to date');
        
        if (showNoUpdateAlert) {
          Alert.alert('Up to Date', 'You have the latest version!');
        }
      }
    } catch (error) {
      console.error('❌ Error checking for updates:', error);
      
      if (showNoUpdateAlert) {
        Alert.alert(
          'Update Check Failed',
          'Could not check for updates. Please try again later.'
        );
      }
    }
  }, [lastUpdateCheck]);

  // ✅ Check for updates on app start
  useEffect(() => {
    if (fontsLoaded) {
      checkForUpdates(false);
    }
  }, [fontsLoaded, checkForUpdates]);

  // ✅ Check for updates when app returns from background
  useEffect(() => {
    if (!UPDATE_CONFIG.checkOnResume) return;

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('📱 App resumed - checking for updates');
        checkForUpdates(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkForUpdates]);

  // ✅ Hide splash when fonts are ready
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
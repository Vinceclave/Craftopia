import 'react-native-gesture-handler';
import React, { useEffect, useCallback, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppState, AppStateStatus } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import * as Updates from 'expo-updates';

import { QueryProvider } from '~/providers/QueryProvider';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigations/AppNavigator';
import { ModalProvider, ModalService } from '~/context/modalContext';
import { WebSocketProvider } from './src/context/WebSocketContext';
import { OfflineModal } from './src/components/common/OfflineModal';


import './global.css';

// Keep splash visible on load
SplashScreen.preventAutoHideAsync().catch(console.warn);

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
      return;
    }

    // Throttle update checks
    const now = Date.now();
    if (now - lastUpdateCheck < UPDATE_CONFIG.checkInterval) {
      return;
    }

    try {
      setLastUpdateCheck(now);

      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {

        await Updates.fetchUpdateAsync();


        // Handle different update strategies
        switch (UPDATE_CONFIG.strategy) {
          case 'automatic':
            // Show modal and restart immediately
            ModalService.show({
              title: '🎉 Update Available',
              message: 'A new version has been downloaded. Restart now to apply the latest improvements.',
              type: 'success',
              confirmText: 'Restart Now',
              cancelText: 'Later',
              onConfirm: async () => {
                await Updates.reloadAsync();
              },
              onCancel: () => {
                // User postponed
              }
            });
            break;

          case 'manual':
            // Just notify, don't auto-restart
            ModalService.show({
              title: '📲 Update Ready',
              message: 'A new version is ready. You can apply it from Settings.',
              type: 'info'
            });
            break;

          case 'silent':
            // Download silently, apply on next natural restart
            break;
        }
      } else {

        if (showNoUpdateAlert) {
          ModalService.show({
            title: 'Up to Date',
            message: 'You have the latest version!',
            type: 'success'
          });
        }
      }
    } catch (error) {

      if (showNoUpdateAlert) {
        ModalService.show({
          title: 'Update Check Failed',
          message: 'Could not check for updates. Please try again later.',
          type: 'error'
        });
      }
    }
  }, [lastUpdateCheck]);

  // ✅ Check for updates on app start
  useEffect(() => {
    async function initUpdates() {
      if (fontsLoaded) {
        try {
          // Splash screen hiding is now handled in AppNavigator
          checkForUpdates(false);
        } catch (e) {
          // silently fail
        }
      }
    }

    initUpdates();

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
            <OfflineModal />
          </ModalProvider>
        </WebSocketProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
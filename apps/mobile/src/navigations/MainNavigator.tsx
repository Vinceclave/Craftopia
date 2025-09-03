// apps/mobile/src/navigations/MainNavigator.tsx
import React from 'react';
import { View, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import TabNavigator from './TabNavigator';

// Inner component that uses the safe area context
function MainNavigatorContent() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: 'transparent',
      // This removes the bottom safe area (navigation bar area)
      marginBottom: Platform.OS === 'android' ? insets.bottom : 0,
    }}>
      {/* Status bar configuration */}
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent={true}
      />
      
      {/* Your tab navigator */}
      <TabNavigator />
    </View>
  );
}

export default function MainNavigator() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top', 'left', 'right']}>
        <MainNavigatorContent />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
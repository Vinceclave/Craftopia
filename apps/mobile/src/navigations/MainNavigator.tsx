import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainNavigatorContent from '~/components/navigations/MainNavigatorContext';

export type RootStackParamList = {
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function MainNavigator() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent', overflow: 'hidden' }} edges={['top', 'left', 'right']}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainNavigatorContent} />
        </Stack.Navigator>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
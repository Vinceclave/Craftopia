import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '~/screens/Home';

export type MainStackParamList = {
  Home: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
  </Stack.Navigator>
);

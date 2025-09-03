import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RegisterScreen } from '../screens/Register';
import { VerifyEmailScreen } from '../screens/VerifyEmail';
import { LoginScreen } from '~/screens/Login';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyEmail: { email?: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
  </Stack.Navigator>
);
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '~/screens/Login';
import { RegisterScreen } from '~/screens/Register';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  // ForgotPassword?: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => (
  <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    {/* <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} /> */}
  </Stack.Navigator>
);

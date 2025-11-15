import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VerifyEmailScreen } from '../screens/VerifyEmail';
import LoginScreen from '~/screens/Login';
import RegisterScreen from '~/screens/Register';
import ForgotPassword from '~/screens/auth/ForgotPassword';
import ResetPassword from '~/screens/auth/ResetPassword';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyEmail: { 
    email?: string;
    token?: string;
    autoVerify?: boolean;
  };
  ResetPassword: { 
    token?: string;
  };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
    </Stack.Navigator>
  );
};
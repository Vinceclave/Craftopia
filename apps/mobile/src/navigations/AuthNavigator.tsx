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
      {/* 1️⃣ Login — Fade */}
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          animation: "fade",
        }}
      />

      {/* 2️⃣ Register — Slide from right */}
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{
          animation: "slide_from_right",
        }}
      />

      {/* 3️⃣ Verify Email — Zoom in */}
      <Stack.Screen 
        name="VerifyEmail" 
        component={VerifyEmailScreen}
        options={{
          presentation: "transparentModal",
          animation: "fade",
        }}
      />

      {/* 4️⃣ Forgot Password — Bottom sheet slide */}
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPassword}
        options={{
          animation: "slide_from_bottom",
        }}
      />

      {/* 5️⃣ Reset Password — Slide from left */}
      <Stack.Screen 
        name="ResetPassword" 
        component={ResetPassword}
        options={{
          animation: "slide_from_left",
        }}
      />
    </Stack.Navigator>
  );
};

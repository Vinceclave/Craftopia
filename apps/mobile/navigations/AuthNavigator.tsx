import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Onboarding from 'screens/auth/Onboarding';
import Login from 'screens/auth/Login';
import Register from 'screens/auth/Register';

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false, 
        animation: 'default', // 👈 slide, fade, flip, etc.

    }}>
      <Stack.Screen name="Onboarding" component={Onboarding} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;

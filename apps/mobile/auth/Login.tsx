import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { useNavigation, useIsFocused } from '@react-navigation/native';

import InputField from '../components/InputField';
import Button from '../components/Button';

const Login = () => {
  const [focused, setFocused] = useState<string | null>(null);
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // 👈 Used for entrance animation

  const handleLogin = () => {
    console.log('Login button pressed');
  };

  const handleOAuth = (provider: string) => {
    console.log(`OAuth with ${provider}`);
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30 }}
      animate={{ opacity: isFocused ? 1 : 0, translateY: isFocused ? 0 : 30 }}
      transition={{ type: 'timing', duration: 500 }}
      className="flex-1 bg-cream px-8 pt-20 pb-10 justify-between"
    >
      {/* 👋 Title & Form */}
      <View>
        {/* Title */}
        <MotiText
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
          className="text-[32px] leading-[40px] font-luckiest tracking-wide text-forest text-center mb-2"
        >
          Welcome Back, Crafter!
        </MotiText>

        {/* Subtitle */}
        <MotiText
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 200, duration: 500 }}
          className="text-base leading-6 text-center text-darkgray mb-8 font-openSans font-light"
        >
          Back to building better
        </MotiText>

        {/* 🔐 Inputs */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300, duration: 500 }}
          className="space-y-4"
        >
          <InputField
            label="Email Address"
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            isFocused={focused === 'email'}
            onFocusField={() => setFocused('email')}
            onBlurField={() => setFocused(null)}
          />
          <InputField
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            isFocused={focused === 'password'}
            onFocusField={() => setFocused('password')}
            onBlurField={() => setFocused(null)}
          />
        </MotiView>

        {/* 🔓 Login Button */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 500, duration: 500 }}
          className="mt-8"
        >
          <Button
            title="Log In"
            onPress={handleLogin}
            textClassName="font-luckiest tracking-wider text-base"
          />
        </MotiView>
      </View>

      {/* 🌐 OAuth + 🔗 Register */}
      <MotiView
        from={{ opacity: 0, translateY: 40 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 600, duration: 500 }}
      >
        <View className="space-y-3 mt-6 mb-4">
          <MotiText className="text-center text-darkgray font-openSans">
            Or log in with
          </MotiText>

          <Button
            title="Continue with Google"
            onPress={() => handleOAuth('Google')}
            className="bg-white border border-lightgray"
            textClassName="text-darkgray font-openSans"
          />
        </View>

        <View className="flex-row justify-center mt-2">
          <MotiText className="text-darkgray font-openSans">
            Don&apos;t have an account?{' '}
          </MotiText>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <MotiText className="text-forest font-openSans font-semibold underline">
              Sign Up
            </MotiText>
          </Pressable>
        </View>
      </MotiView>
    </MotiView>
  );
};

export default Login;

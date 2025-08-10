// components/auth/login/LoginFooter.tsx
import React from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { MotiView, MotiText } from 'moti';
import Button from 'components/Button';

interface Props {
  onLogin: () => void;
  disabled: boolean;
  loading: boolean;
  onNavigateRegister: () => void;
}

const LoginFooter: React.FC<Props> = ({ onLogin, disabled, loading, onNavigateRegister }) => {
  return (
    <>
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 500, duration: 500 }}
        className="mt-8"
      >
        <Button
          title={loading ? '' : 'Login'}
          onPress={onLogin}
          textClassName="font-luckiest tracking-wider text-base"
          style={{ height: 48 }}
        >
          {loading && <ActivityIndicator size="small" color="#fff" />}
        </Button>
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 40 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 600, duration: 500 }}
      >
        <View className="flex-row justify-center mt-2">
          <MotiText className="text-darkgray font-openSans text-xs">
            Not a member yet?{' '}
          </MotiText>
          <Pressable onPress={onNavigateRegister}>
            <MotiText className="text-forest font-openSans font-semibold underline text-xs  ">
              Start crafting today!
            </MotiText>
          </Pressable>
        </View>
      </MotiView>
    </>
  );
};

export default LoginFooter;

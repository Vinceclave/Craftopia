import React from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { useNavigation } from '@react-navigation/native';
import Button from 'components/Button';

interface Props {
  onRegister: () => void;
  disabled: boolean;
  loading: boolean;
}

const RegisterFooter: React.FC<Props> = ({ onRegister, disabled, loading }) => {
  const navigation = useNavigation();

  return (
    <>
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 500, duration: 500 }}
        className="mt-6"
      >
        <Button
          title={loading ? '' : 'Register'}
          onPress={onRegister}
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
        <View className="flex-row justify-center mt-3">
          <MotiText className="text-darkgray font-openSans text-xs">
            Already part of our eco community?{' '}
          </MotiText>
          <Pressable onPress={() => navigation.navigate('Login' as never)}>
            <MotiText className="text-forest font-openSans font-semibold underline text-xs">
              Log in and keep creating!
            </MotiText>
          </Pressable>
        </View>
      </MotiView>
    </>
  );
};

export default RegisterFooter;

import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { Paintbrush, Scissors } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

// Animated components
const AnimatedPaintbrush = Animated.createAnimatedComponent(Paintbrush);
const AnimatedScissors = Animated.createAnimatedComponent(Scissors);
const AnimatedPressable = Animated.createAnimatedComponent(View);

const Onboarding = () => {
  const navigation = useNavigation();

  // Floating animation values
  const brushFloat = useSharedValue(0);
  const scissorFloat = useSharedValue(0);

  useEffect(() => {
    brushFloat.value = withRepeat(
      withTiming(-10, { duration: 2500 }),
      -1,
      true
    );
    scissorFloat.value = withRepeat(
      withTiming(10, { duration: 2500 }),
      -1,
      true
    );
  }, []);

  const brushStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: brushFloat.value }, { rotateZ: '-15deg' }],
  }));

  const scissorStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scissorFloat.value }, { rotateZ: '15deg' }],
  }));

  // Button animation
  const buttonScale = useSharedValue(0.8);

  useEffect(() => {
    buttonScale.value = withSpring(1, {
      damping: 10,
      stiffness: 120,
    });
  }, []);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <MotiView className="flex-1 relative justify-between bg-cream px-8 pt-20 pb-24">
      {/* Animated Icons */}
      <AnimatedPaintbrush
        size={300}
        color="#2B4A2F"
        style={[
          {
            position: 'absolute',
            top: -40,
            right: -60,
            opacity: 0.8,
          },
          brushStyle,
        ]}
      />
      <AnimatedScissors
        size={300}
        color="#2B4A2F"
        style={[
          {
            position: 'absolute',
            bottom: -10,
            left: -40,
            opacity: 0.8,
          },
          scissorStyle,
        ]}
      />

      {/* Logo */}
      <MotiText
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600 }}
        className="text-base uppercase font-luckiest text-forest tracking-[4px]"
      >
        Craftopia
      </MotiText>

      {/* Main Content */}
      <View className="space-y-6 mt-4">
        <MotiText
          from={{ opacity: 0, translateY: 40 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 100, duration: 700 }}
          className="text-[40px] leading-[50px] font-bold font-openSans text-forest"
        >
          Turn Trash{'\n'}Into Treasure
        </MotiText>

        <MotiText
          from={{ opacity: 0, translateY: 40 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 700 }}
          className="text-base leading-7 font-openSans text-darkgray"
        >
          Transform recyclables into meaningful creations. Discover fun, eco-smart DIYs crafted just for you.
        </MotiText>
      </View>

      {/* CTA Button */}
      <AnimatedPressable
        style={[buttonStyle]}
        className="bg-forest rounded-full py-5 px-8 shadow-lg mt-10 active:opacity-90"
        onTouchEnd={() => navigation.navigate('Register')}
      >
        <MotiText
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 400 }}
          className="text-xl font-luckiest text-center text-softwhite tracking-wider"
        >
          Let’s Get Crafted
        </MotiText>
      </AnimatedPressable>
    </MotiView>
  );
};

export default Onboarding;

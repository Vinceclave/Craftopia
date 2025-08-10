import React, { useContext } from 'react';
import { MotiView, MotiText } from 'moti';
import { Easing } from 'react-native-reanimated';
import { AuthContext } from 'contexts/AuthContext';

const HomeHeader = () => {
  const { user } = useContext(AuthContext);
  const userName = user?.username || 'Eco Explorer';

  return (
    <MotiView
      from={{ opacity: 0, translateY: -12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 500, easing: Easing.out(Easing.ease) }}
      className="mb-6 mt-4"
      accessible
      accessibilityRole="header"
      accessibilityHint="Displays your name and a motivational tagline"
    >
      <MotiText
        from={{ opacity: 0, translateX: -6 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ delay: 100, type: 'spring', stiffness: 90 }}
        className="text-3xl font-luckiest text-forest"
        accessibilityLabel={`Welcome back, ${userName}`}
      >
        Welcome back,{' '}
        <MotiText className="text-3xl font-luckiest text-green-700">{userName}</MotiText>
      </MotiText>

      <MotiText
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 300, type: 'timing' }}
        className="text-base font-openSans text-darkgray mt-1"
      >
        Track your progress, earn rewards, and stay green 🌱
      </MotiText>
    </MotiView>
  );
};

export default HomeHeader;

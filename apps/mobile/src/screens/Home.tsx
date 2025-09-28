import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeHeader } from '~/components/home/HomeHeader';
import { HomeStats } from '~/components/home/HomeStats';

export const HomeScreen = () => {
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className='flex-1 bg-craftopia-light'>
      <HomeHeader />
      <HomeStats />
      
      {/* Other screen content */}
    </SafeAreaView>
  );
};
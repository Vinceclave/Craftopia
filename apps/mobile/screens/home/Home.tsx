import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import HomeHeader from './components/HomeHeader';
import Hero from './components/Hero';
import Accomplishments from './components/Accomplishments';
import RecentActivity from './components/RecentActivity';

const Home = () => {
  return (
    <SafeAreaView style={{paddingTop: 20 }} className="flex-1 bg-cream">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
        }}
      >
        <HomeHeader />
        <Hero />
        <Accomplishments />
        <RecentActivity />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;

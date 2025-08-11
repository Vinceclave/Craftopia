import React from 'react';
import { SafeAreaView, FlatList, View, Text } from 'react-native';
import HomeHeader from './components/HomeHeader';
import Hero from './components/Hero';
import Accomplishments from './components/Accomplishments';
import RecentActivity from './components/RecentActivity';

const dummyData = [
  { id: '1', title: 'Craft Completed', description: 'You finished “Upcycled Bottle Planter.”', date: 'Aug 10, 2025' },
  { id: '2', title: 'Eco Challenge Joined', description: 'Joined “Plastic-Free Week” challenge.', date: 'Aug 8, 2025' },
  { id: '3', title: 'New Craft Idea', description: 'Saved “DIY Paper Organizer.”', date: 'Aug 5, 2025' },
];

const Home = () => {
  const ListHeader = () => (
    <View className='p-2 py-10 pb-20'>
      <HomeHeader />
      <Hero />
      <Accomplishments />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF9F6',  }}>
      <FlatList
        data={dummyData} // you can remove this or keep if you want FlatList to scroll the recent activity also
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<ListHeader />}
        ListFooterComponent={<RecentActivity />}
        showsVerticalScrollIndicator={false}
        // You can remove renderItem here because RecentActivity manages its own list
        // Or alternatively just replace FlatList by ScrollView + separate sections
      />
    </SafeAreaView>
  );
};

export default Home;

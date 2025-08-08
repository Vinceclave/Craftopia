import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Home as HomeIcon,
  Rss,
  Compass,
  User,
} from 'lucide-react-native';

import HomeScreen from '../../(tabs)/Home';
import FeedScreen from '../../(tabs)/Feed';
import CraftScreen from '../../(tabs)/Craft';
import QuestScreen from '../../(tabs)/Quest';
import ProfileScreen from '../../(tabs)/Profile';

import CraftTabButton from './CraftTabButton';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: route.name !== 'Craft',
        tabBarActiveTintColor: '#6CAC73', // soft green (from Tailwind)
        tabBarInactiveTintColor: '#2B4A2F', // deep forest (from Tailwind)
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          fontFamily: 'OpenSans',
        },
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: '#FFF9F0', // cream
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: Platform.OS === 'ios' ? 90 : 75,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 8,
          elevation: 20,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarIcon: ({ color, focused }) => {
          const size = focused ? 26 : 24;
          switch (route.name) {
            case 'Home':
              return <HomeIcon size={size} color={color} />;
            case 'Feed':
              return <Rss size={size} color={color} />;
            case 'Quest':
              return <Compass size={size} color={color} />;
            case 'Profile':
              return <User size={size} color={color} />;
            case 'Craft':
              return <CraftTabButton />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Craft" component={CraftScreen} />
      <Tab.Screen name="Quest" component={QuestScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default AppNavigator;

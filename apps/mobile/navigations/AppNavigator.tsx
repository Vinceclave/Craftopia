import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MotiView } from 'moti';
import { Home, User, Hammer, Newspaper, Leaf } from 'lucide-react-native';

import HomeScreen from 'screens/home/Home';
import Profile from 'screens/profile/profile';
import Craft from 'screens/craft/Craft';
import Feed from 'screens/feed/Feed';
import Challenges from 'screens/challenges/Challenges';
import CustomTabButton from 'components/TabButton';

const Tab = createBottomTabNavigator();

const AnimatedIcon = ({ focused, children }: { focused: boolean; children: React.ReactNode }) => {
  return (
    <MotiView
      animate={{
        scale: focused ? 1.2 : 1,
        opacity: focused ? 1 : 0.7,
      }}
      transition={{
        type: 'spring',
        stiffness: 150,
        damping: 15,
      }}
      className="items-center justify-center"
    >
      {children}
    </MotiView>
  );
};

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Craft') {
            return null; // Handled by custom tab button
          }

          let IconComponent = Home;

          switch (route.name) {
            case 'Home':
              IconComponent = Home;
              break;
            case 'Profile':
              IconComponent = User;
              break;
            case 'Feed':
              IconComponent = Newspaper;
              break;
            case 'Eco':
              IconComponent = Leaf;
              break;
          }

          return (
            <AnimatedIcon focused={focused}>
              <IconComponent
                color={color}
                width={size + 4}
                height={size + 4}
                strokeWidth={2.5}
              />
            </AnimatedIcon>
          );
        },
        tabBarActiveTintColor: '#2B4A2F', // forest green
        tabBarInactiveTintColor: '#BABABA', // lightgray
        tabBarStyle: {
          height: 80,
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          borderRadius: 24,
          elevation: 8,
          backgroundColor: '#FFF9F0', // cream
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'LuckiestGuy',
          fontWeight: '600',
          fontSize: 13,
          marginBottom: 6,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Feed" component={Feed} />
      <Tab.Screen
        name="Craft"
        component={Craft}
        options={{
          tabBarButton: (props) => (
            <CustomTabButton
              {...props}
              label="Craft"
              focused={props.accessibilityState?.selected ?? false}
              icon={<Hammer width={32} height={32} strokeWidth={2.5} />}
            />
          ),
        }}
      />
      <Tab.Screen name="Eco" component={Challenges} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default AppNavigator;

// TabNavigator.tsx - MATCHING HOME DESIGN
import React, { useState, useEffect, forwardRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation, NavigationState } from "@react-navigation/native";
import type { RootTabParamList } from "./types";

import { Home, List, Hammer, Leaf, User } from "lucide-react-native";
import { HomeStack } from "./stacks/HomeStack";
import { ProfileStack } from "./stacks/ProfileStack";
import { EcoQuestStack } from "./stacks/EcoQuestStack";
import { FeedStack } from "./stacks/FeedStack";
import { CraftStack } from "./stacks/CraftStack";
import { Platform, Animated } from "react-native";

const Tab = createBottomTabNavigator<RootTabParamList>();

// ✅ Matching AnimatedTabIcon with home design
const AnimatedTabIcon = forwardRef<any, { focused: boolean; children: React.ReactNode; color: string }>(
  ({ focused, children, color }, ref) => {
    const scaleValue = React.useRef(new Animated.Value(focused ? 1.1 : 1)).current;
    const opacityValue = React.useRef(new Animated.Value(focused ? 1 : 0.6)).current;

    React.useEffect(() => {
      if (focused) {
        Animated.parallel([
          Animated.spring(scaleValue, {
            toValue: 1.1,
            friction: 4,
            tension: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.spring(scaleValue, {
            toValue: 1,
            friction: 6,
            tension: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 0.6,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [focused]);

    return (
      <Animated.View
        ref={ref}
        style={{
          transform: [{ scale: scaleValue }],
          opacity: opacityValue,
        }}
      >
        {children}
      </Animated.View>
    );
  }
);

AnimatedTabIcon.displayName = 'AnimatedTabIcon';

export default function TabNavigator() {
  const [tabBarVisible, setTabBarVisible] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', (e) => {
      const getCurrentScreenName = (state: NavigationState | undefined): string => {
        if (!state) return '';
        
        const route:any = state.routes[state.index];
        if (route.state) {
          return getCurrentScreenName(route.state);
        }
        return route.name;
      };

      const currentScreenName = getCurrentScreenName(e.data.state);
      const hideOnScreens = ['EditProfile', 'Create', 'Settings', 'QuestDetails', 'UserChallenges'];
      setTabBarVisible(!hideOnScreens.includes(currentScreenName));
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#5A7160", // Matching home primary color
        tabBarInactiveTintColor: "#9CA3AF", // Matching home secondary text color
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === "ios" ? 80 : 70,
          paddingTop: 6,
          paddingBottom: Platform.OS === "ios" ? 24 : 6,
          paddingHorizontal: 12,
          borderTopWidth: 0,
          // Matching home shadow style
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 4,
          display: tabBarVisible ? 'flex' : 'none',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 2,
          letterSpacing: 0.2,
          // Using home font system
          fontFamily: "nunito",
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        tabBarItemStyle: {
          borderRadius: 12,
          marginHorizontal: 2,
          paddingVertical: 6,
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
        },
        // Matching home background colors
        tabBarActiveBackgroundColor: "rgba(90, 113, 96, 0.08)",
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <AnimatedTabIcon focused={focused} color={color}>
              <Home
                color={focused ? "#5A7160" : "#9CA3AF"}
                size={focused ? 22 : 20}
                strokeWidth={focused ? 2.2 : 1.8}
              />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tab.Screen
        name="FeedStack"
        component={FeedStack}
        options={{
          title: "Feed",
          tabBarIcon: ({ focused, color }) => (
            <AnimatedTabIcon focused={focused} color={color}>
              <List
                color={focused ? "#5A7160" : "#9CA3AF"}
                size={focused ? 22 : 20}
                strokeWidth={focused ? 2.2 : 1.8}
              />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tab.Screen
        name="CraftStack"
        component={CraftStack}
        options={{
          title: "Craft",
          tabBarIcon: ({ focused, color }) => (
            <AnimatedTabIcon focused={focused} color={color}>
              <Hammer
                color={focused ? "#D4A96A" : "#9CA3AF"} // Using home accent color
                size={focused ? 22 : 20}
                strokeWidth={focused ? 2.2 : 1.8}
              />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tab.Screen
        name="EcoQuestStack"
        component={EcoQuestStack}
        options={{
          title: "Quest",
          tabBarIcon: ({ focused, color }) => (
            <AnimatedTabIcon focused={focused} color={color}>
              <Leaf
                color={focused ? "#5A7160" : "#9CA3AF"}
                size={focused ? 22 : 20}
                strokeWidth={focused ? 2.2 : 1.8}
              />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tab.Screen
        name="ProfileStack"
        component={ProfileStack}
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <AnimatedTabIcon focused={focused} color={color}>
              <User
                color={focused ? "#5A7160" : "#9CA3AF"}
                size={focused ? 22 : 20}
                strokeWidth={focused ? 2.2 : 1.8}
              />
            </AnimatedTabIcon>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

TabNavigator.displayName = "TabNavigator";
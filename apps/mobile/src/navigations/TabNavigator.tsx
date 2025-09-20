import React, { useState, useEffect } from "react";
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

// Enhanced animated tab bar component
const AnimatedTabIcon = ({ focused, children, color }) => {
  const scaleValue = React.useRef(new Animated.Value(focused ? 1.15 : 1)).current;
  const bounceValue = React.useRef(new Animated.Value(0)).current;
  const opacityValue = React.useRef(new Animated.Value(focused ? 1 : 0.7)).current;

  React.useEffect(() => {
    if (focused) {
      // Scale and bounce animation
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.25,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(scaleValue, {
            toValue: 1.15,
            friction: 4,
            tension: 180,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(bounceValue, {
            toValue: -6,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.spring(bounceValue, {
            toValue: 0,
            friction: 5,
            tension: 120,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0.7,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused]);

  return (
    <Animated.View
      style={{
        transform: [
          { scale: scaleValue },
          { translateY: bounceValue },
        ],
        opacity: opacityValue,
      }}
    >
      {children}
    </Animated.View>
  );
};

export default function TabNavigator() {
  const [tabBarVisible, setTabBarVisible] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', (e) => {
      // Function to recursively find the current screen name
      const getCurrentScreenName = (state: NavigationState | undefined): string => {
        if (!state) return '';
        
        const route = state.routes[state.index];
        if (route.state) {
          return getCurrentScreenName(route.state);
        }
        return route.name;
      };

      const currentScreenName = getCurrentScreenName(e.data.state);
      const hideOnScreens = ['EditProfile']; // Only hide on EditProfile
      setTabBarVisible(!hideOnScreens.includes(currentScreenName));
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#004E98",
        tabBarInactiveTintColor: "#333333",
        tabBarStyle: {
          backgroundColor: "white",
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === "ios" ? 85 : 75,
          paddingTop: 4,
          paddingBottom: 2,
          paddingHorizontal: 4,
          borderTopWidth: 1,
          borderTopColor: "rgba(0, 0, 0, 0.06)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 8,
          // Animate tab bar visibility
          display: tabBarVisible ? 'flex' : 'none',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          marginTop: 3,
          letterSpacing: 0.3,
          textTransform: "uppercase",
          fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarItemStyle: {
          borderRadius: 16,
          marginHorizontal: 3,
          paddingVertical: 4,
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
        },
        tabBarActiveBackgroundColor: "rgba(0, 78, 152, 0.08)",
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarBackground: () => (
          <Animated.View
            style={{
              flex: 1,
              backgroundColor: "white",
              borderTopWidth: 1,
              borderTopColor: "rgba(0, 0, 0, 0.06)",
            }}
          />
        ),
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
                color={focused ? "#004E98" : "#333333"}
                size={focused ? 25 : 23}
                strokeWidth={focused ? 2.2 : 1.8}
                fill={focused ? "rgba(0, 78, 152, 0.15)" : "none"}
              />
              {focused && (
                <Animated.View
                  style={{
                    position: "absolute",
                    top: -3,
                    left: -3,
                    right: -3,
                    bottom: -3,
                    borderRadius: 12,
                    backgroundColor: "rgba(0, 78, 152, 0.08)",
                    zIndex: -1,
                  }}
                />
              )}
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
                color={focused ? "#00A896" : "#333333"}
                size={focused ? 25 : 23}
                strokeWidth={focused ? 2.2 : 1.8}
                fill={focused ? "rgba(0, 168, 150, 0.15)" : "none"}
              />
              {focused && (
                <Animated.View
                  style={{
                    position: "absolute",
                    top: -3,
                    left: -3,
                    right: -3,
                    bottom: -3,
                    borderRadius: 12,
                    backgroundColor: "rgba(0, 168, 150, 0.08)",
                    zIndex: -1,
                  }}
                />
              )}
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
                color={focused ? "#FF6700" : "#333333"}
                size={focused ? 26 : 24}
                strokeWidth={focused ? 2.4 : 1.8}
                fill={focused ? "rgba(255, 103, 0, 0.15)" : "none"}
              />
              {focused && (
                <Animated.View
                  style={{
                    position: "absolute",
                    top: -4,
                    left: -4,
                    right: -4,
                    bottom: -4,
                    borderRadius: 14,
                    backgroundColor: "rgba(255, 103, 0, 0.12)",
                    borderWidth: 1.5,
                    borderColor: "rgba(255, 103, 0, 0.25)",
                    zIndex: -1,
                  }}
                />
              )}
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
                color={focused ? "#7C9885" : "#333333"}
                size={focused ? 25 : 23}
                strokeWidth={focused ? 2.2 : 1.8}
                fill={focused ? "rgba(124, 152, 133, 0.15)" : "none"}
              />
              {focused && (
                <Animated.View
                  style={{
                    position: "absolute",
                    top: -3,
                    left: -3,
                    right: -3,
                    bottom: -3,
                    borderRadius: 12,
                    backgroundColor: "rgba(124, 152, 133, 0.08)",
                    zIndex: -1,
                  }}
                />
              )}
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
                color={focused ? "#004E98" : "#333333"}
                size={focused ? 25 : 23}
                strokeWidth={focused ? 2.2 : 1.8}
                fill={focused ? "rgba(0, 78, 152, 0.15)" : "none"}
              />
              {focused && (
                <Animated.View
                  style={{
                    position: "absolute",
                    top: -3,
                    left: -3,
                    right: -3,
                    bottom: -3,
                    borderRadius: 12,
                    backgroundColor: "rgba(0, 78, 152, 0.08)",
                    zIndex: -1,
                  }}
                />
              )}
            </AnimatedTabIcon>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

TabNavigator.displayName = "TabNavigator";
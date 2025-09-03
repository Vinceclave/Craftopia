import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { RootTabParamList } from "./types";

import { Home, List, Hammer, Leaf, User } from "lucide-react-native";
import { HomeStack } from "./stacks/HomeStack";
import { ProfileStack } from "./stacks/ProfileStack";
import { EcoQuestStack } from "./stacks/EcoQuestStack";
import { FeedStack } from "./stacks/FeedStack";
import { CraftScreen } from "~/screens/Craft";
import { CraftStack } from "./stacks/CraftStack";

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#16a34a", // green highlight
        tabBarInactiveTintColor: "#6b7280", // gray
      }}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="FeedStack"
        component={FeedStack}
        options={{
          title: "Feed",
          tabBarIcon: ({ color, size }) => (
            <List color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="CraftStack"
        component={CraftStack}
        options={{
          title: "Craft",
          tabBarIcon: ({ color, size }) => (
            <Hammer color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="EcoQuestStack"
        component={EcoQuestStack}
        options={{
          title: "EcoQuest",
          tabBarIcon: ({ color, size }) => (
            <Leaf color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileStack"
        component={ProfileStack}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

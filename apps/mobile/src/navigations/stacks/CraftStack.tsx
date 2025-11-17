import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CraftScreen } from "~/screens/Craft";
import { CraftDetailsScreen } from "~/screens/craft/CraftDetails";
import type { CraftStackParamList } from "../types";

const Stack = createNativeStackNavigator<CraftStackParamList>();

export function CraftStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Craft" component={CraftScreen} />
      <Stack.Screen name="CraftDetails" component={CraftDetailsScreen} />
    </Stack.Navigator>
  );
}

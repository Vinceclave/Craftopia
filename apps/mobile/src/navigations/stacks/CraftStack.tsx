import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CraftProcessingScreen } from "~/screens/craft/CraftProcessing";
import { CraftResultsScreen } from "~/screens/craft/CraftResults";
import { CraftDetailsScreen } from "~/screens/craft/CraftDetails";
import type { CraftStackParamList } from "../types";
import { CraftScanScreen } from "~/screens/craft/CraftScanScreen";
import { CraftScreen } from "~/screens/Craft";

const Stack = createNativeStackNavigator<CraftStackParamList>();

export function CraftStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Craft" component={CraftScreen} />
      <Stack.Screen name="CraftScan" component={CraftScanScreen} />
      <Stack.Screen 
        name="CraftProcessing" 
        component={CraftProcessingScreen}
        options={{ gestureEnabled: false }} // Prevent back gesture during processing
      />
      <Stack.Screen name="CraftResults" component={CraftResultsScreen} />
      <Stack.Screen name="CraftDetails" component={CraftDetailsScreen} />
    </Stack.Navigator>
  );
}
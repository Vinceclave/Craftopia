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
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right', // Smooth animations
      }}
    >
      <Stack.Screen 
        name="Craft" 
        component={CraftScreen}
        options={{
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="CraftScan" 
        component={CraftScanScreen}
        options={{
          gestureEnabled: true,
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="CraftProcessing" 
        component={CraftProcessingScreen}
        options={{ 
          gestureEnabled: false, // Prevent accidental swipe during processing
          animation: 'fade',
        }}
      />
      <Stack.Screen 
        name="CraftResults" 
        component={CraftResultsScreen}
        options={{
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="CraftDetails" 
        component={CraftDetailsScreen}
        options={{
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}
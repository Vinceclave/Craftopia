import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CraftScreen } from "~/screens/Craft";
// import { CraftDetailsScreen } from "~/screens/CraftDetails";
// import { CraftEditorScreen } from "~/screens/CraftEditor";
import type { CraftStackParamList } from "../types";
import { CameraCraftScreen } from "~/screens/craft/CameraScreen";

const Stack = createNativeStackNavigator<CraftStackParamList>();

export function CraftStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Craft" component={CraftScreen} />
      {/* <Stack.Screen name="CraftDetails" component={CraftDetailsScreen} />
      <Stack.Screen name="CraftEditor" component={CraftEditorScreen} /> */}
        <Stack.Screen name="CameraCraft" component={CameraCraftScreen} />
 {/* 👈 Add this */}

    </Stack.Navigator>
  );
}

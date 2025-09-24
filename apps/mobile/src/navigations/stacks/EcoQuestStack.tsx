import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { EcoQuestScreen } from "~/screens/EcoQuest";
import { QuestDetailsScreen } from "~/screens/quest/QuestDetails";
import type { EcoQuestStackParamList } from "../types";

const Stack = createNativeStackNavigator<EcoQuestStackParamList>();

export function EcoQuestStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="EcoQuest" component={EcoQuestScreen} />
      <Stack.Screen name="QuestDetails" component={QuestDetailsScreen} />
    </Stack.Navigator>
  );
}

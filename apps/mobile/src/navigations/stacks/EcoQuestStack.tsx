// apps/mobile/src/navigations/EcoQuestStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { EcoQuestScreen } from "~/screens/EcoQuest";
import { QuestDetailsScreen } from "~/screens/quest/QuestDetails";
import type { EcoQuestStackParamList } from "../types";
import { UserChallengesScreen } from "~/screens/quest/UserChallenges";
import { RewardsScreen } from "~/screens/quest/RewardScreen";
import { RedemptionHistoryScreen } from "~/screens/quest/RedemtionHistoryScreen";

const Stack = createNativeStackNavigator<EcoQuestStackParamList>();

export function EcoQuestStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="EcoQuest" component={EcoQuestScreen} />
      <Stack.Screen name="QuestDetails" component={QuestDetailsScreen} />
      <Stack.Screen name="UserChallenges" component={UserChallengesScreen} />
      <Stack.Screen name="Rewards" component={RewardsScreen} />
      <Stack.Screen name="RedemptionHistory" component={RedemptionHistoryScreen} />
    </Stack.Navigator>
  );
}
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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 1️⃣ Main EcoQuest Screen - fade in */}
      <Stack.Screen
        name="EcoQuest"
        component={EcoQuestScreen}
        options={{
          animation: "fade",
        }}
      />

      {/* 2️⃣ Quest Details - slide from right */}
      <Stack.Screen
        name="QuestDetails"
        component={QuestDetailsScreen}
        options={{
          animation: "slide_from_right",
        }}
      />

      {/* 3️⃣ User Challenges - slide from bottom */}
      <Stack.Screen
        name="UserChallenges"
        component={UserChallengesScreen}
        options={{
          animation: "slide_from_bottom",
        }}
      />

      {/* 4️⃣ Rewards - flip animation */}
      <Stack.Screen
        name="Rewards"
        component={RewardsScreen}
        options={{
          animation: "flip",
        }}
      />

      {/* 5️⃣ Redemption History - slide from left */}
      <Stack.Screen
        name="RedemptionHistory"
        component={RedemptionHistoryScreen}
        options={{
          animation: "slide_from_left",
        }}
      />
    </Stack.Navigator>
  );
}

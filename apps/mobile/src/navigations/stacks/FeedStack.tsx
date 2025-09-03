import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FeedScreen } from "~/screens/Feed";
// import { PostDetailsScreen } from "~/screens/PostDetails";
import type { FeedStackParamList } from "../types";

const Stack = createNativeStackNavigator<FeedStackParamList>();

export function FeedStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Feed" component={FeedScreen} />
      {/* <Stack.Screen name="PostDetails" component={PostDetailsScreen} /> */}
    </Stack.Navigator>
  );
}

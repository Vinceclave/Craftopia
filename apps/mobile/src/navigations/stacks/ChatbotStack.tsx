import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ChatBotScreen } from "~/screens/Chatbot";

export type ChatBotStackParamList = {
  ChatBot: undefined;
};

const Stack = createNativeStackNavigator<ChatBotStackParamList>();

export function ChatBotStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatBot" component={ChatBotScreen} />
    </Stack.Navigator>
  );
}

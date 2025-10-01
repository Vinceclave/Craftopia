// apps/mobile/src/navigations/MainNavigator.tsx
import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainNavigatorContent from '~/components/navigations/MainNavigatorContext';
import { ChatBotScreen } from '~/screens/Chatbot';

export type RootStackParamList = {
  MainTabs: undefined;
  ChatbotScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function MainNavigator() {
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-transparent overflow-hidden" edges={['top', 'left', 'right']}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Tabs wrapped in a stack */}
          <Stack.Screen name="MainTabs" component={MainNavigatorContent} />
            
            {/* Chatbot lives outside tabs */}
            <Stack.Screen 
              name="ChatbotScreen" 
              component={ChatBotScreen} 
              options={{ presentation: 'modal' }} // modal style, optional
            />
        </Stack.Navigator>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

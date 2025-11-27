import React from 'react';
import { View, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DraggableButton from './DraggableButton';
import TabNavigator from '~/navigations/TabNavigator';

export default function MainNavigatorContent() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingBottom: Platform.OS === 'android' ? insets.bottom : 0 }}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />

      <TabNavigator />
      <DraggableButton />
    </View>
  );
}
  
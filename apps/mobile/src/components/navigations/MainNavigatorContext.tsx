import React from 'react';
import { View, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DraggableButton from './DraggableButton';
import TabNavigator from '~/navigations/TabNavigator';

export default function MainNavigatorContent() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'transparent',
        marginBottom: Platform.OS === 'android' ? insets.bottom : 0
      }}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      
      <TabNavigator />
      <DraggableButton />
    </View>
  );
}
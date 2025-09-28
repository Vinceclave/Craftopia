// apps/mobile/src/navigations/MainNavigator.tsx
import React from 'react';
import { View, StatusBar, Platform, Dimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import TabNavigator from './TabNavigator';
import Draggable from 'react-native-draggable';

function MainNavigatorContent() {
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get('window');

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'transparent',
        marginBottom: Platform.OS === 'android' ? insets.bottom : 0,
      }}
    >
      {/* Status bar configuration */}
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Tab navigation */}
      <TabNavigator />

      {/* Floating Draggable button */}
      <Draggable
        x={width - 80} // initial position near right edge
        y={height - 200} // initial position near bottom
        renderSize={60}
        isCircle
        shouldReverse={false} // keep at drop position
        renderColor="#4CAF50"
        renderText="+"
        minX={0}
        minY={0}
        maxX={width - 60}
        maxY={height - 150}
        onShortPressRelease={() => alert('Quick Action!')}
        onDragRelease={(e, gestureState, bounds) => {
          console.log('📍 Drag released at:', bounds);
        }}
      />
    </View>
  );
}

export default function MainNavigator() {
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: 'transparent' }}
        edges={['top', 'left', 'right']}
      >
        <MainNavigatorContent />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

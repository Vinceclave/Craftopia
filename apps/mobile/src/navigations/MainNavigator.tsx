// apps/mobile/src/navigations/MainNavigator.tsx
import React, { useRef, useState } from 'react';
import { 
  View, 
  StatusBar, 
  Platform, 
  Dimensions, 
  Text, 
  PanResponder,
  Animated
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import TabNavigator from './TabNavigator';

function BotIcon() {
  return (
    <View className="w-8 h-8 items-center justify-center">
      {/* Bot head */}
      <View className="w-6 h-5 bg-white rounded-lg mb-0.5">
        {/* Eyes */}
        <View className="flex-row justify-around items-center flex-1 px-1">
          <View className="w-1 h-1 bg-craftopia-primary rounded-full" />
          <View className="w-1 h-1 bg-craftopia-primary rounded-full" />
        </View>
      </View>
      
      {/* Bot body */}
      <View className="w-5 h-2 bg-white rounded" />
      
      {/* Antenna */}
      <View className="absolute -top-0.5 left-3.5 w-0.5 h-1.5 bg-white">
        <View className="absolute -top-0.5 -left-0.5 w-1 h-1 bg-white rounded-full" />
      </View>
    </View>
  );
}

function DraggableButton() {
  const { width, height } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  
  const buttonSize = 60;
  const pan = useRef(new Animated.ValueXY({
    x: width - buttonSize - 20,
    y: height - 200 - insets.bottom
  })).current;
  
  const [isDragging, setIsDragging] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
      },
      onPanResponderGrant: () => {
        setIsDragging(true);
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (evt, gestureState) => {
        setIsDragging(false);
        pan.flattenOffset();
        
        // Handle tap if minimal movement
        if (Math.abs(gestureState.dx) < 8 && Math.abs(gestureState.dy) < 8) {
          console.log('Bot button tapped!');
          // Add your bot action here
          return;
        }
        
        // Smooth boundary constraints
        const maxX = width - buttonSize;
        const maxY = height - buttonSize - insets.bottom;
        const minY = insets.top;
        
        const finalX = Math.min(Math.max(0, pan.x._value), maxX);
        const finalY = Math.min(Math.max(minY, pan.y._value), maxY);
        
        // Smooth spring animation
        Animated.spring(pan, {
          toValue: { x: finalX, y: finalY },
          useNativeDriver: false,
          tension: 120,
          friction: 8,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      className={`absolute rounded-full justify-center items-center z-50`}
      style={[
        {
          width: buttonSize,
          height: buttonSize,
          backgroundColor: isDragging ? '#5D8AA8' : '#6B8E6B', // info blue when dragging, secondary green normally
          elevation: isDragging ? 12 : 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: isDragging ? 6 : 3 },
          shadowOpacity: isDragging ? 0.4 : 0.3,
          shadowRadius: isDragging ? 8 : 4,
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: isDragging ? 1.15 : 1 },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={{ opacity: isDragging ? 0.9 : 1 }}>
        <BotIcon />
      </View>
    </Animated.View>
  );
}

function MainNavigatorContent() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-transparent"
      style={{
        marginBottom: Platform.OS === 'android' ? insets.bottom : 0,
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

export default function MainNavigator() {
  return (
    <SafeAreaProvider>
      <SafeAreaView
        className="flex-1 bg-transparent"
        edges={['top', 'left', 'right']}
      >
        <MainNavigatorContent />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
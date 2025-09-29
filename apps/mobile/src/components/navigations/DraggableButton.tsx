import React, { useRef, useState } from 'react';
import { View, Dimensions, PanResponder, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import BotIcon from './BotIcon';

export default function DraggableButton() {
  const { width, height } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const buttonSize = 60;
  const pan = useRef(
    new Animated.ValueXY({
      x: width - buttonSize - 20,
      y: height - 200 - insets.bottom,
    })
  ).current;

  const [isDragging, setIsDragging] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) =>
        Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3,

      onPanResponderGrant: () => {
        setIsDragging(true);
        pan.setOffset({ x: pan.x._value, y: pan.y._value });

        // ✅ Navigate on touch (finger down) if not dragging
        setTimeout(() => {
          if (!isDragging) {
            navigation.navigate('ChatbotScreen' as never);
          }
        }, 150); // slight delay to distinguish drag vs tap
      },

      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),

      onPanResponderRelease: () => {
        setIsDragging(false);
        pan.flattenOffset();

        // Constrain within screen bounds
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
      className="absolute rounded-full justify-center items-center z-50"
      style={[
        {
          width: buttonSize,
          height: buttonSize,
          backgroundColor: isDragging ? '#5D8AA8' : '#6B8E6B',
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

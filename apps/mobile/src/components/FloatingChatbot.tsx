import React, { useRef, useState, useEffect } from 'react';
import { View, Dimensions, PanResponder, Animated, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BotIcon from './BotIcon';
import { FloatingChatbot } from '~/components/FloatingChatbot';

export default function DraggableButton() {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const insets = useSafeAreaInsets();

  const isSmallScreen = dimensions.width < 375;
  const buttonSize = isSmallScreen ? 50 : 60;
  
  const initialX = dimensions.width - buttonSize - (isSmallScreen ? 16 : 20);
  const initialY = dimensions.height - (Platform.OS === 'web' ? buttonSize + 40 : 200 + insets.bottom);

  const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;

  const [isDragging, setIsDragging] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const dragStartTime = useRef(0);
  const dragDistance = useRef(0);

  // Handle window resize
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
      
      // Update button position on resize
      const newX = window.width - buttonSize - (isSmallScreen ? 16 : 20);
      const newY = window.height - (Platform.OS === 'web' ? buttonSize + 40 : 200 + insets.bottom);
      
      Animated.timing(pan, {
        toValue: { x: newX, y: newY },
        duration: 300,
        useNativeDriver: false,
      }).start();
    });

    return () => subscription?.remove();
  }, [buttonSize, isSmallScreen, insets.bottom, pan]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        dragStartTime.current = Date.now();
        dragDistance.current = 0;
        setIsDragging(false);
        
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },

      onPanResponderMove: (evt, gestureState) => {
        dragDistance.current = Math.sqrt(
          Math.pow(gestureState.dx, 2) + Math.pow(gestureState.dy, 2)
        );
        
        if (dragDistance.current > 10) {
          setIsDragging(true);
        }

        pan.setValue({
          x: gestureState.dx,
          y: gestureState.dy,
        });
      },

      onPanResponderRelease: () => {
        const wasDragging = dragDistance.current > 10;
        const duration = Date.now() - dragStartTime.current;
        
        pan.flattenOffset();

        const maxX = dimensions.width - buttonSize;
        const maxY = dimensions.height - buttonSize - (Platform.OS === 'web' ? 20 : insets.bottom);
        const minY = Platform.OS === 'web' ? 20 : insets.top;

        const finalX = Math.min(Math.max(0, pan.x._value), maxX);
        const finalY = Math.min(Math.max(minY, pan.y._value), maxY);

        Animated.spring(pan, {
          toValue: { x: finalX, y: finalY },
          useNativeDriver: false,
          tension: 120,
          friction: 8,
        }).start();

        setIsDragging(false);

        if (!wasDragging && duration < 300) {
          setTimeout(() => {
            setIsChatVisible(true);
          }, 50);
        }
      },
    })
  ).current;

  const handleOpenChat = () => {
    setIsChatVisible(true);
  };

  const handleCloseChat = () => {
    setIsChatVisible(false);
  };

  return (
    <>
      <Animated.View
        style={{
          position: 'absolute',
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: isDragging ? '#5D8AA8' : '#6B8E6B',
          elevation: isDragging ? 12 : 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: isDragging ? 6 : 3 },
          shadowOpacity: isDragging ? 0.4 : 0.3,
          shadowRadius: isDragging ? 8 : 4,
          zIndex: 9999,
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: isDragging ? 1.15 : 1 },
          ],
          cursor: Platform.OS === 'web' ? 'pointer' : undefined,
        } as any}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenChat}
          style={{ opacity: isDragging ? 0.9 : 1 }}
        >
          <BotIcon size={isSmallScreen ? 28 : 32} />
        </TouchableOpacity>
      </Animated.View>

      <FloatingChatbot 
        visible={isChatVisible} 
        onClose={handleCloseChat} 
      />
    </>
  );
}
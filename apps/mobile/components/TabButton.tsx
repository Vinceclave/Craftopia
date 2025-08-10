import React from 'react';
import { TouchableOpacity, Text, Platform } from 'react-native';
import { MotiView } from 'moti';

interface CustomTabButtonProps {
  onPress?: () => void;
  icon: React.ReactNode;
  label: string;
  focused?: boolean;
}

const CustomTabButton = ({
  onPress,
  icon,
  label,
  focused = false,
}: CustomTabButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      {...(Platform.OS === 'android' ? { android_ripple: { color: '#a3b18a', borderless: true } } : {})}
      className="items-center -top-6 px-2"
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
    >
      <MotiView
        animate={{
          scale: focused ? 1.15 : 1,
          opacity: focused ? 1 : 0.7,
        }}
        transition={{
          type: 'spring',
          damping: 12,
          stiffness: 120,
        }}
        className={`${focused ? 'bg-forest' : 'bg-lightgray'} w-16 h-16 rounded-full flex items-center justify-center shadow-xl shadow-black/40`}
      >
        {React.cloneElement(icon as React.ReactElement, { color: '#fff' })}
      </MotiView>

      <MotiView
        animate={{ opacity: focused ? 1 : 0.7 }}
        transition={{ type: 'timing', duration: 200 }}
      >
        <Text className={`${focused ? 'text-forest' : 'text-lightgray'} mt-2 text-sm font-luckiest font-semibold tracking-wider`}>
          {label}
        </Text>
      </MotiView>
    </TouchableOpacity>
  );
};

export default CustomTabButton;

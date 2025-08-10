import React from 'react';
import { Text, Pressable, PressableProps } from 'react-native';

interface ButtonProps extends PressableProps {
  title: string;
  className?: string;
  textClassName?: string;
}

const Button = ({ title, className = '', textClassName = '', ...props }: ButtonProps) => {
  return (
    <Pressable
      {...props}
      className={`w-full py-2 rounded-lg items-center justify-center bg-forest ${className}`}
      android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
    >
      <Text className={`text-white font-openSans text-sm ${textClassName}`}>
        {title}
      </Text>
    </Pressable>
  );
};

export default Button;

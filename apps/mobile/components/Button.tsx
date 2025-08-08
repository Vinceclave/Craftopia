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
      className={`w-full py-3.5 rounded-xl items-center justify-center bg-forest ${className}`}
    >
      <Text className={`text-white font-openSans text-base ${textClassName}`}>
        {title}
      </Text>
    </Pressable>
  );
};

export default Button;

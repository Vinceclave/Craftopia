import React from 'react';
import { View } from 'react-native';

interface BotIconProps {
  size?: number;
}

export default function BotIcon({ size = 32 }: BotIconProps) {
  const scale = size / 32;
  
  return (
    <View style={{ 
      width: size, 
      height: size, 
      alignItems: 'center', 
      justifyContent: 'center',
      transform: [{ scale }]
    }}>
      {/* Bot head */}
      <View style={{ 
        width: 24, 
        height: 20, 
        backgroundColor: '#FFFFFF', 
        borderRadius: 8, 
        marginBottom: 2,
        borderWidth: 1,
        borderColor: '#3B6E4D'
      }}>
        {/* Eyes */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-around', 
          alignItems: 'center', 
          flex: 1, 
          paddingHorizontal: 4 
        }}>
          <View style={{ width: 4, height: 4, backgroundColor: '#3B6E4D', borderRadius: 2 }} />
          <View style={{ width: 4, height: 4, backgroundColor: '#3B6E4D', borderRadius: 2 }} />
        </View>
      </View>
      
      {/* Bot body */}
      <View style={{ 
        width: 20, 
        height: 8, 
        backgroundColor: '#FFFFFF', 
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#3B6E4D'
      }} />
      
      {/* Antenna */}
      <View style={{ 
        position: 'absolute', 
        top: -2, 
        left: 14, 
        width: 2, 
        height: 6, 
        backgroundColor: '#3B6E4D' 
      }}>
        <View style={{ 
          position: 'absolute', 
          top: -2, 
          left: -2, 
          width: 4, 
          height: 4, 
          backgroundColor: '#3B6E4D', 
          borderRadius: 2 
        }} />
      </View>
    </View>
  );
}
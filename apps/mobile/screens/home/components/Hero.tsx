import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Camera } from 'lucide-react-native';
import { MotiView, MotiText } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const Hero = () => {
  const navigation = useNavigation();

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 500 }}
      className="rounded-3xl overflow-hidden shadow-lg mb-6"
    >
      <LinearGradient
        colors={['#A7F3D0', '#6EE7B7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-6"
      >
        <MotiText className="text-2xl font-bold text-gray-900 mb-2">
          Snap & Generate Crafts
        </MotiText>

        <Text className="text-gray-700 mb-5">
          Tap the button below to scan recyclable items and get craft ideas from AI!
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          className="flex-row items-center justify-center bg-green-500 py-3 px-5 rounded-full shadow-md"
          onPress={() => navigation.navigate('Craft' as never)} // 👈 Navigate to Craft
        >
          <Camera size={20} color="white" style={{ marginRight: 8 }} />
          <Text className="text-white font-semibold">
            Launch AI Craft Generator
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </MotiView>
  );
};

export default Hero;

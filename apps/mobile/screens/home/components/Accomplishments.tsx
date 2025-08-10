import React from 'react';
import { ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, MotiText } from 'moti';
import { Sparkles } from 'lucide-react-native';

const data = [
  { value: 24, label: 'Crafts Created', colors: ['#FDE68A', '#F59E0B'] },
  { value: 54, label: 'Items Recycled', colors: ['#A7F3D0', '#34D399'] },
  { value: 19, label: 'Points Earned', colors: ['#93C5FD', '#3B82F6'] },
];

const Accomplishments = () => {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 500 }}
      className="mb-8"
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 4,
          gap: 14,
        }}
      >
        {data.map((item, index) => (
          <LinearGradient
            key={index}
            colors={item.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 18,
              paddingVertical: 14,
              paddingHorizontal: 18,
              flexDirection: 'row',
              alignItems: 'center',
              minWidth: 180,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            {/* Icon */}
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.25)',
                padding: 10,
                borderRadius: 50,
                marginRight: 12,
              }}
            >
              <Sparkles size={28} color="white" />
            </View>

            {/* Text */}
            <View>
              <MotiText
                from={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: 28,
                  lineHeight: 32,
                }}
              >
                {item.value}
              </MotiText>
              <MotiText
                style={{
                  color: 'white',
                  fontSize: 14,
                  opacity: 0.9,
                }}
              >
                {item.label}
              </MotiText>
            </View>
          </LinearGradient>
        ))}
      </ScrollView>
    </MotiView>
  );
};

export default Accomplishments;

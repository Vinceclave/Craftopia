import React from 'react';
import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Leaf, Award, Hammer } from 'lucide-react-native';
import { MotiView, MotiText } from 'moti';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 600 }}
      className="flex-1 bg-cream px-6 pt-20 pb-24"
    >
      <ScrollView showsVerticalScrollIndicator={false} className="space-y-8">
        
        {/* Header */}
        <View>
          <MotiText
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 100 }}
            className="text-4xl font-luckiest text-orange leading-tight"
          >
            Welcome Back, Beans!
          </MotiText>
          <Text className="text-base font-semibold text-forest mt-2">
            Track your journey, earn rewards, and inspire change.
          </Text>
        </View>

        {/* Stats Cards */}
        <View className="flex-row justify-between space-x-4">
          <MotiView
            from={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 200 }}
            className="flex-1 bg-softwhite p-5 rounded-2xl shadow-md"
          >
            <Leaf color="#2B4A2F" />
            <Text className="text-2xl font-bold text-forest mt-2">12</Text>
            <Text className="text-sm text-darkgray mt-1">Upcycled Projects</Text>
          </MotiView>
          
          <MotiView
            from={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 300 }}
            className="flex-1 bg-softwhite p-5 rounded-2xl shadow-md"
          >
            <Award color="#FF6B00" />
            <Text className="text-2xl font-bold text-forest mt-2">3</Text>
            <Text className="text-sm text-darkgray mt-1">Badges Earned</Text>
          </MotiView>
        </View>

        {/* CTA Card */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400 }}
          className="bg-orange p-6 rounded-2xl shadow-lg"
        >
          <Text className="text-xl font-bold text-white mb-1">Start a New Craft</Text>
          <Text className="text-sm text-white font-opensans mb-4">
            Generate project ideas from recyclables you have at home.
          </Text>
          <Pressable
            onPress={() => navigation.navigate('Craft')}
            className="bg-white py-2 px-4 rounded-full flex-row items-center justify-center"
          >
            <Hammer size={20} color="#FF6B00" />
            <Text className="ml-2 text-orange font-bold">Craft Now</Text>
          </Pressable>
        </MotiView>

        {/* Recent Activity Section */}
        <View>
          <Text className="text-lg font-semibold text-forest mb-4">Recent Activity</Text>
          <View className="bg-softwhite p-4 rounded-xl shadow-sm">
            <Text className="text-sm text-darkgray">You completed “Plastic Bottle Planter” 🌱</Text>
            <Text className="text-xs text-lightgray mt-1">2 days ago</Text>
          </View>
        </View>
      </ScrollView>
    </MotiView>
  );
};

export default HomeScreen;

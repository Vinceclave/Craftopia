// apps/mobile/src/screens/AboutUsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { ChevronLeft, Heart, Users, Leaf, Sparkles } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Main: undefined;
  // Add other screen types as needed
};

type AboutUsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AboutUsScreen = () => {
  const navigation = useNavigation<AboutUsScreenNavigationProp>();

  const handleBack = () => {
    navigation.goBack();
  };

  const coreValues = [
    {
      icon: Sparkles,
      title: 'Creativity',
      description: 'We value original ideas and encourage experimentation.',
      color: '#E6B655'
    },
    {
      icon: Leaf,
      title: 'Sustainability',
      description: 'Eco-friendly crafting is at the heart of everything we do.',
      color: '#3B6E4D'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Sharing knowledge and inspiring others is our priority.',
      color: '#5C89B5'
    },
    {
      icon: Heart,
      title: 'Accessibility',
      description: 'Crafting should be simple and enjoyable for everyone.',
      color: '#D66B4E'
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-craftopia-surface">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-200">
        <TouchableOpacity 
          onPress={handleBack}
          className="p-2 -ml-2"
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color="#3B6E4D" />
        </TouchableOpacity>
        <Text className="text-xl font-poppinsBold text-craftopia-primary ml-2">
          About Us
        </Text>
      </View>

      {/* Content */}
      <ScrollView 
        className="flex-1 px-6 py-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View className="mb-6">
          <Text className="text-base font-nunito text-craftopia-textSecondary leading-7">
            Welcome to <Text className="font-poppinsBold text-craftopia-accent">Craftopia</Text> — 
            a platform dedicated to transforming everyday recyclable materials into creative, 
            functional, and sustainable crafts. Our mission is to empower everyone to unleash 
            their creativity while contributing to a greener planet.
          </Text>
        </View>

        {/* Vision */}
        <View className="mb-6">
          <Text className="text-lg font-poppinsBold text-craftopia-primary mb-3">
            Our Vision
          </Text>
          <View className="bg-craftopia-light rounded-xl p-4">
            <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 italic">
              "To inspire a global community where creativity meets sustainability, making eco-friendly 
              crafting accessible, fun, and rewarding for all ages."
            </Text>
          </View>
        </View>

        {/* Mission */}
        <View className="mb-6">
          <Text className="text-lg font-poppinsBold text-craftopia-primary mb-3">
            Our Mission
          </Text>
          <View className="space-y-2">
            <View className="flex-row items-start">
              <View className="w-2 h-2 rounded-full bg-craftopia-accent mt-2 mr-3" />
              <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 flex-1">
                Provide innovative craft ideas using recyclable and everyday materials.
              </Text>
            </View>
            <View className="flex-row items-start">
              <View className="w-2 h-2 rounded-full bg-craftopia-accent mt-2 mr-3" />
              <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 flex-1">
                Educate users about sustainable practices and environmental responsibility.
              </Text>
            </View>
            <View className="flex-row items-start">
              <View className="w-2 h-2 rounded-full bg-craftopia-accent mt-2 mr-3" />
              <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 flex-1">
                Build a supportive, creative community of makers and eco-enthusiasts.
              </Text>
            </View>
            <View className="flex-row items-start">
              <View className="w-2 h-2 rounded-full bg-craftopia-accent mt-2 mr-3" />
              <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 flex-1">
                Encourage fun, learning, and self-expression through hands-on projects.
              </Text>
            </View>
          </View>
        </View>

        {/* Core Values */}
        <View className="mb-6">
          <Text className="text-lg font-poppinsBold text-craftopia-primary mb-3">
            Our Core Values
          </Text>
          <View className="space-y-4">
            {coreValues.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <View 
                  key={index}
                  className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                >
                  <View className="flex-row items-start">
                    <View 
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${value.color}15` }}
                    >
                      <IconComponent size={20} color={value.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-poppinsBold mb-1" style={{ color: value.color }}>
                        {value.title}
                      </Text>
                      <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6">
                        {value.description}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Meet the Team */}
        <View className="mb-6">
          <Text className="text-lg font-poppinsBold text-craftopia-primary mb-3">
            Meet the Team
          </Text>
          <View className="bg-craftopia-light rounded-xl p-4">
            <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6">
              Our team is composed of passionate designers, developers, and environmental advocates, 
              dedicated to making Craftopia a hub for creativity, sustainability, and learning. 
              Together, we bring you innovative craft ideas and a welcoming community.
            </Text>
          </View>
        </View>

        {/* Join Community CTA */}
        <View className="mb-6">
          <View className="bg-craftopia-primary rounded-xl p-5">
            <Text className="text-lg font-poppinsBold text-white text-center mb-2">
              Join Our Community
            </Text>
            <Text className="text-sm font-nunito text-white text-center leading-6 opacity-90">
              Be part of a growing community of makers who are transforming waste into wonder, 
              one craft at a time.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View className="items-center py-6">
          <Text className="text-xs font-nunito text-craftopia-textSecondary">
            © 2025 Craftopia. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
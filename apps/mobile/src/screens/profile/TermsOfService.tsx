// apps/mobile/src/screens/TermsOfServiceScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Main: undefined;
  // Add other screen types as needed
};

type TermsOfServiceScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const TermsOfServiceScreen = () => {
  const navigation = useNavigation<TermsOfServiceScreenNavigationProp>();

  const handleBack = () => {
    navigation.goBack();
  };

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
          Terms of Service
        </Text>
      </View>

      {/* Content */}
      <ScrollView 
        className="flex-1 px-6 py-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <Text className="text-base font-nunito text-craftopia-textSecondary mb-6 leading-7">
          Welcome to <Text className="font-poppinsBold text-craftopia-accent">Craftopia</Text>! 
          These Terms of Service explain how you can use our app and services. By accessing or 
          using Craftopia, you agree to follow these rules. Please read carefully.
        </Text>

        {/* Section 1 */}
        <View className="mb-6">
          <Text className="text-lg font-poppinsBold text-craftopia-primary mb-3">
            1. Using Craftopia
          </Text>
          <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 mb-3">
            You are welcome to explore and create using Craftopia. To ensure a safe and enjoyable experience:
          </Text>
          <View className="pl-4">
            <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 mb-1">
              • Use the app responsibly and respectfully.
            </Text>
            <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 mb-1">
              • Do not upload harmful, illegal, or inappropriate content.
            </Text>
            <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6">
              • Follow all local laws and regulations while using the app.
            </Text>
          </View>
        </View>

        {/* Section 2 */}
        <View className="mb-6">
          <Text className="text-lg font-poppinsBold text-craftopia-primary mb-3">
            2. Intellectual Property
          </Text>
          <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 mb-3">
            Craftopia owns the designs, AI-generated craft ideas, and content provided in the app. You may:
          </Text>
          <View className="pl-4 mb-3">
            <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 mb-1">
              • Use content for personal, non-commercial projects.
            </Text>
            <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6">
              • Share ideas with proper attribution when necessary.
            </Text>
          </View>
          <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 mb-2">
            You may NOT:
          </Text>
          <View className="pl-4">
            <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 mb-1">
              • Sell, redistribute, or modify Craftopia content for commercial purposes without permission.
            </Text>
            <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6">
              • Claim ownership of AI-generated craft ideas provided by the app.
            </Text>
          </View>
        </View>

        {/* Section 3 */}
        <View className="mb-6">
          <Text className="text-lg font-poppinsBold text-craftopia-primary mb-3">
            3. Privacy & Data
          </Text>
          <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6">
            We care about your privacy. We collect minimal data to improve your experience. 
            Your personal information will never be sold or shared with third parties without consent.
          </Text>
        </View>

        {/* Section 4 */}
        <View className="mb-6">
          <Text className="text-lg font-poppinsBold text-craftopia-primary mb-3">
            4. Limitation of Liability
          </Text>
          <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 mb-3">
            Craftopia provides creative suggestions and guidance. We are not responsible for:
          </Text>
          <View className="pl-4">
            <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 mb-1">
              • Any injuries, damages, or losses resulting from following craft instructions.
            </Text>
            <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 mb-1">
              • Misuse of materials or tools during crafting.
            </Text>
            <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6">
              • Technical issues, downtime, or data loss.
            </Text>
          </View>
        </View>

        {/* Footer Note */}
        <Text className="text-xs font-nunito text-craftopia-textSecondary mt-8 mb-6">
          Last updated: November 2025
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};
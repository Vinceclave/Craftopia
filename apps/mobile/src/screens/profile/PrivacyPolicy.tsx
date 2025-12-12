// apps/mobile/src/screens/PrivacyPolicyScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

type RootStackParamList = {
  Main: undefined;
  // Add other screen types as needed
};

type PrivacyPolicyScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation<PrivacyPolicyScreenNavigationProp>();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
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
          Privacy Policy
        </Text>
      </View>

      {/* Content */}
      <ScrollView 
        className="flex-1 px-6 py-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-base font-nunito text-craftopia-textSecondary mb-6 leading-7">
          At Craftopia, we value your privacy and are committed to protecting your personal information. 
          This Privacy Policy explains how we collect, use, share, and protect the data you provide when using our app.
        </Text>

        {/* Section 1 */}
        <View className="mb-6">
          <Text className="text-lg font-poppinsBold text-craftopia-primary mb-3">
            1. Information We Collect
          </Text>
          <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 mb-3">
            We collect the following types of information:
          </Text>
          <View className="pl-4">
            <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 mb-1">
              • Personal information such as your name, email address, and profile information when you register or update your account.
            </Text>
            <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 mb-1">
              • Content you upload or share, including posts, images, comments, and messages.
            </Text>
            <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6">
              • Usage data, such as app interactions, device information, and analytics to improve our services.
            </Text>
          </View>
        </View>

        {/* Section 2 */}
        <View className="mb-6">
          <Text className="text-lg font-poppinsBold text-craftopia-primary mb-3">
            2. How We Use Your Information
          </Text>
          <View className="pl-4">
            <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 mb-1">
              • To provide and improve our app, features, and services.
            </Text>
            <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 mb-1">
              • To personalize your experience, including content recommendations.
            </Text>
            <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 mb-1">
              • To communicate with you about updates, promotions, or safety notifications.
            </Text>
            <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6">
              • To maintain a safe and secure community.
            </Text>
          </View>
        </View>

        {/* Section 3 */}
        <View className="mb-6">
          <Text className="text-lg font-poppinsBold text-craftopia-primary mb-3">
            3. Sharing Your Information
          </Text>
          <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 mb-3">
            We do not sell your personal information. We may share information with:
          </Text>
          <View className="pl-4">
            <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 mb-1">
              • Service providers who help us operate the app (e.g., cloud services, analytics).
            </Text>
            <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 mb-1">
              • Authorities when required by law or to protect our legal rights.
            </Text>
            <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6">
              • Other users, only the information you choose to share publicly within the app.
            </Text>
          </View>
        </View>

        {/* Section 4 */}
        <View className="mb-6">
          <Text className="text-lg font-poppinsBold text-craftopia-primary mb-3">
            4. Data Security
          </Text>
          <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6">
            We implement reasonable technical and organizational measures to protect your data against unauthorized access, 
            alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
          </Text>
        </View>

        {/* Section 5 */}
        <View className="mb-6">
          <Text className="text-lg font-poppinsBold text-craftopia-primary mb-3">
            5. Your Rights
          </Text>
          <View className="pl-4">
            <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 mb-1">
              • You can access, update, or delete your personal information through your account settings.
            </Text>
            <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6 mb-1">
              • You can opt out of promotional communications by following the instructions in emails or notifications.
            </Text>
            <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6">
              • You can request information about how we use your data by contacting us.
            </Text>
          </View>
        </View>

        {/* Section 6 */}
        <View className="mb-6">
          <Text className="text-lg font-poppinsBold text-craftopia-primary mb-3">
            6. Children's Privacy
          </Text>
          <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6">
            Craftopia is not intended for children under 13. We do not knowingly collect personal information from children under 13. 
            If we discover such data, we will delete it promptly.
          </Text>
        </View>

        {/* Section 7 */}
        <View className="mb-6">
          <Text className="text-lg font-poppinsBold text-craftopia-primary mb-3">
            7. Changes to This Policy
          </Text>
          <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6">
            We may update this Privacy Policy from time to time. Changes will be posted with the updated date, 
            and we encourage you to review this page periodically.
          </Text>
        </View>

        {/* Section 8 */}
        <View className="mb-6">
          <Text className="text-lg font-poppinsBold text-craftopia-primary mb-3">
            8. Contact Us
          </Text>
          <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6">
            If you have any questions about this Privacy Policy or how we handle your data, please contact us at{' '}
            <Text className="font-poppinsBold text-craftopia-accent">support@craftopia.com</Text>.
          </Text>
        </View>

        {/* Footer Note */}
        <Text className="text-xs font-nunito text-craftopia-textSecondary mt-8 mb-6">
          Last updated: November 2025
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};
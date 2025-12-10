// apps/mobile/src/screens/ContactUsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { ModalService } from '~/context/modalContext';
import {
  ChevronLeft,
  Mail,
  Phone,
  MessageCircle,
  Send,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Heart
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

type RootStackParamList = {
  Main: undefined;
  // Add other screen types as needed
};

type ContactUsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ContactUsScreen = () => {
  const navigation = useNavigation<ContactUsScreenNavigationProp>();
  const [message, setMessage] = useState('');

  const handleBack = () => {
    navigation.goBack();
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help with technical issues and account questions',
      action: () => Linking.openURL('mailto:support@craftopia.com'),
      color: '#3B6E4D'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Call us for immediate assistance',
      action: () => Linking.openURL('tel:+1234567890'),
      color: '#5C89B5'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our AI assistant 24/7',
      action: () => {
        // Navigate to chat screen or open chat modal
        ModalService.show({
          title: 'Live Chat',
          message: 'Opening chat with our AI assistant...',
          type: 'info'
        });
      },
      color: '#E6B655'
    }
  ];

  const socialMedia = [
    {
      icon: Facebook,
      name: 'Facebook',
      url: 'https://facebook.com/craftopia',
      color: '#1877F2'
    },
    {
      icon: Instagram,
      name: 'Instagram',
      url: 'https://instagram.com/craftopia',
      color: '#E4405F'
    },
    {
      icon: Twitter,
      name: 'Twitter',
      url: 'https://twitter.com/craftopia',
      color: '#1DA1F2'
    },
    {
      icon: Youtube,
      name: 'YouTube',
      url: 'https://youtube.com/craftopia',
      color: '#FF0000'
    }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // Implement message sending logic
      Linking.openURL(`mailto:support@craftopia.com?subject=Feedback from Craftopia App&body=${message}`);
      setMessage('');
      ModalService.show({
        title: 'Message Sent',
        message: 'Thank you for your feedback! We\'ll get back to you soon.',
        type: 'success'
      });
    }
  };

  const handleSocialMediaPress = (url: string) => {
    Linking.openURL(url).catch(() => {
      ModalService.show({
        title: 'Error',
        message: 'Could not open the link. Please check if the app is installed.',
        type: 'error'
      });
    });
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
          Contact Us
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View className="px-6 py-4">
          <Text className="text-base font-nunito text-craftopia-textSecondary leading-7 mb-2">
            We'd love to hear from you! Whether you have questions, feedback, or need assistance,
            our team is committed to responding promptly and helping you get the most out of Craftopia.
          </Text>
          <View className="flex-row items-center bg-craftopia-light rounded-xl p-3 mt-2">
            <Heart size={16} color="#3B6E4D" />
            <Text className="text-sm font-nunito text-craftopia-primary ml-2">
              Average response time: 2-4 hours
            </Text>
          </View>
        </View>

        {/* Contact Methods */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-poppinsBold text-craftopia-primary mb-4">
            Customer Support
          </Text>
          <View className="space-y-3">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon;
              return (
                <TouchableOpacity
                  key={index}
                  className="bg-white rounded-xl p-4 border border-gray-200 flex-row items-center"
                  onPress={method.action}
                  activeOpacity={0.7}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: `${method.color}15` }}
                  >
                    <IconComponent size={24} color={method.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-poppinsBold text-craftopia-textPrimary mb-1">
                      {method.title}
                    </Text>
                    <Text className="text-sm font-nunito text-craftopia-textSecondary">
                      {method.description}
                    </Text>
                  </View>
                  <ChevronLeft size={20} color="#6B7280" />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Quick Feedback Form */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-poppinsBold text-craftopia-primary mb-4">
            Quick Feedback
          </Text>
          <View className="bg-white rounded-xl p-4 border border-gray-200">
            <Text className="text-sm font-nunito text-craftopia-textSecondary mb-3">
              Share your ideas for new features, report bugs, or provide general comments:
            </Text>
            <View className="bg-craftopia-light rounded-lg p-3 mb-3 min-h-[100px]">
              <Text className="text-base font-nunito text-craftopia-textSecondary">
                {message || 'Type your message here...'}
              </Text>
            </View>
            <TouchableOpacity
              className="bg-craftopia-primary rounded-lg py-3 flex-row items-center justify-center"
              onPress={handleSendMessage}
              disabled={!message.trim()}
              activeOpacity={0.7}
            >
              <Send size={18} color="white" />
              <Text className="text-base font-poppinsBold text-white ml-2">
                Send Message
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Social Media */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-poppinsBold text-craftopia-primary mb-4">
            Connect With Us
          </Text>
          <Text className="text-sm font-nunito text-craftopia-textSecondary mb-3">
            Stay updated and inspired by following Craftopia on social platforms:
          </Text>
          <View className="flex-row justify-between">
            {socialMedia.map((social, index) => {
              const IconComponent = social.icon;
              return (
                <TouchableOpacity
                  key={index}
                  className="items-center"
                  onPress={() => handleSocialMediaPress(social.url)}
                  activeOpacity={0.7}
                >
                  <View
                    className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
                    style={{ backgroundColor: `${social.color}15` }}
                  >
                    <IconComponent size={24} color={social.color} />
                  </View>
                  <Text className="text-xs font-nunito text-craftopia-textSecondary">
                    {social.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* FAQ Quick Link */}
        <View className="px-6 mb-6">
          <TouchableOpacity
            className="bg-craftopia-light rounded-xl p-4 flex-row items-center justify-between"
            onPress={() => navigation.navigate('HelpCenter' as never)}
            activeOpacity={0.7}
          >
            <View>
              <Text className="text-base font-poppinsBold text-craftopia-primary mb-1">
                Check Our FAQ
              </Text>
              <Text className="text-sm font-nunito text-craftopia-textSecondary">
                Find quick answers to common questions
              </Text>
            </View>
            <ChevronLeft size={20} color="#3B6E4D" />
          </TouchableOpacity>
        </View>

        {/* Business Hours */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-poppinsBold text-craftopia-primary mb-3">
            Support Hours
          </Text>
          <View className="bg-white rounded-xl p-4 border border-gray-200">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm font-nunito text-craftopia-textSecondary">Monday - Friday</Text>
              <Text className="text-sm font-poppinsBold text-craftopia-primary">9:00 AM - 6:00 PM</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm font-nunito text-craftopia-textSecondary">Saturday</Text>
              <Text className="text-sm font-poppinsBold text-craftopia-primary">10:00 AM - 4:00 PM</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm font-nunito text-craftopia-textSecondary">Sunday</Text>
              <Text className="text-sm font-poppinsBold text-craftopia-primary">Closed</Text>
            </View>
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
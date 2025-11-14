// apps/mobile/src/screens/HelpCenterScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { ChevronLeft, HelpCircle, MessageCircle, Search, BookOpen, Settings } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Main: undefined;
  // Add other screen types as needed
};

type HelpCenterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HelpCenterScreen = () => {
  const navigation = useNavigation<HelpCenterScreenNavigationProp>();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleBack = () => {
    navigation.goBack();
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const helpSections = [
    {
      id: 'getting-started',
      icon: BookOpen,
      title: 'Getting Started',
      items: [
        {
          question: 'Creating an account',
          answer: 'Sign up using email or social login. Verify your account to unlock full features.'
        },
        {
          question: 'Setting up your profile',
          answer: 'Add a profile picture, username, and bio to personalize your experience.'
        },
        {
          question: 'Exploring Craft Suggestions',
          answer: 'Input recyclable materials or items to receive creative craft ideas.'
        },
        {
          question: 'Marketplace',
          answer: 'Browse and share your creations with the Craftopia community.'
        }
      ]
    },
    {
      id: 'faq',
      icon: HelpCircle,
      title: 'Frequently Asked Questions',
      items: [
        {
          question: 'How do I generate craft ideas?',
          answer: 'Enter the materials you have, and Craftopia\'s AI will suggest creative projects step by step.'
        },
        {
          question: 'Can I save my favorite ideas?',
          answer: 'Yes! Tap the heart icon on any craft suggestion to save it to your profile.'
        },
        {
          question: 'How does the points system work?',
          answer: 'Earn points by completing craft projects, sharing creations, and participating in challenges.'
        },
        {
          question: 'Is my personal data safe?',
          answer: 'Absolutely. We follow strict privacy practices and never share your data without consent.'
        },
        {
          question: 'Can I edit or delete my profile?',
          answer: 'Yes, go to Settings and tap "Edit Profile" to update your info or remove your account.'
        }
      ]
    },
    {
      id: 'troubleshooting',
      icon: Settings,
      title: 'Troubleshooting',
      items: [
        {
          question: 'App crashes or freezes',
          answer: 'Try restarting the app, clearing cache, or updating to the latest version.'
        },
        {
          question: 'Unable to log in',
          answer: 'Ensure your credentials are correct, check internet connection, or reset your password.'
        },
        {
          question: 'Craft suggestions not showing',
          answer: 'Check your internet connection and make sure you entered valid items for suggestions.'
        },
        {
          question: 'Notifications not working',
          answer: 'Ensure notification permissions are enabled for the app in your device settings.'
        }
      ]
    },
    {
      id: 'tips',
      icon: MessageCircle,
      title: 'Tips & Best Practices',
      items: [
        {
          question: 'Sustainable Crafting',
          answer: 'Use common household items for quick and sustainable craft projects.'
        },
        {
          question: 'Point System',
          answer: 'Check the point system regularly to participate in challenges and earn rewards.'
        },
        {
          question: 'Community Sharing',
          answer: 'Share your creations with the community to inspire others and gain recognition.'
        },
        {
          question: 'AI Assistance',
          answer: 'Use the AI chatbot for personalized help, including step-by-step guidance.'
        }
      ]
    }
  ];

  const handleContactSupport = () => {
    // Navigate to support chat or open email
    console.log('Contact support pressed');
  };

  const handleSearchHelp = () => {
    // Navigate to search screen or implement search
    console.log('Search help pressed');
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
          Help Center
        </Text>
      </View>

      {/* Content */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <TouchableOpacity 
          className="mx-6 my-4 bg-white rounded-xl p-4 border border-gray-200 flex-row items-center"
          onPress={handleSearchHelp}
          activeOpacity={0.7}
        >
          <Search size={20} color="#6B7280" />
          <Text className="text-gray-500 ml-3 text-base font-nunito">
            Search for help...
          </Text>
        </TouchableOpacity>

        {/* Intro */}
        <View className="px-6 mb-6">
          <Text className="text-base font-nunito text-craftopia-textSecondary leading-7">
            Welcome to the Craftopia Help Center! Here you can find detailed guides, 
            answers to common questions, and troubleshooting tips. Our AI assistant is 
            also available for real-time support if you need help with any feature.
          </Text>
        </View>

        {/* Help Sections */}
        <View className="px-6 space-y-4">
          {helpSections.map((section) => {
            const IconComponent = section.icon;
            const isExpanded = expandedSection === section.id;
            
            return (
              <View 
                key={section.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <TouchableOpacity
                  className="flex-row items-center justify-between p-4"
                  onPress={() => toggleSection(section.id)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 rounded-full bg-craftopia-light items-center justify-center mr-3">
                      <IconComponent size={20} color="#3B6E4D" />
                    </View>
                    <Text className="text-lg font-poppinsBold text-craftopia-primary flex-1">
                      {section.title}
                    </Text>
                  </View>
                  <ChevronLeft 
                    size={20} 
                    color="#3B6E4D" 
                    style={{ 
                      transform: [{ rotate: isExpanded ? '-90deg' : '0deg' }] 
                    }} 
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View className="border-t border-gray-100">
                    {section.items.map((item, index) => (
                      <View 
                        key={index}
                        className="p-4 border-b border-gray-50 last:border-b-0"
                      >
                        <Text className="text-base font-poppinsBold text-craftopia-textPrimary mb-2">
                          {item.question}
                        </Text>
                        <Text className="text-sm font-nunito text-craftopia-textSecondary leading-6">
                          {item.answer}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Contact Support CTA */}
        <View className="mx-6 my-6">
          <View className="bg-craftopia-primary rounded-xl p-5">
            <Text className="text-lg font-poppinsBold text-white text-center mb-2">
              Need More Help?
            </Text>
            <Text className="text-sm font-nunito text-white text-center leading-6 opacity-90 mb-4">
              Our AI assistant is available 24/7 to answer questions, provide step-by-step guidance, 
              and troubleshoot issues.
            </Text>
            <TouchableOpacity 
              className="bg-white rounded-lg py-3 px-4 items-center"
              onPress={handleContactSupport}
              activeOpacity={0.7}
            >
              <Text className="text-base font-poppinsBold text-craftopia-primary">
                Contact Support
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-poppinsBold text-craftopia-primary mb-4">
            Quick Actions
          </Text>
          <View className="flex-row flex-wrap -mx-2">
            <TouchableOpacity 
              className="bg-craftopia-light rounded-xl p-4 m-2 flex-1 min-w-[45%]"
              activeOpacity={0.7}
            >
              <Text className="text-sm font-poppinsBold text-craftopia-primary mb-1">
                Report a Bug
              </Text>
              <Text className="text-xs font-nunito text-craftopia-textSecondary">
                Found an issue? Let us know
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-craftopia-light rounded-xl p-4 m-2 flex-1 min-w-[45%]"
              activeOpacity={0.7}
            >
              <Text className="text-sm font-poppinsBold text-craftopia-primary mb-1">
                Video Tutorials
              </Text>
              <Text className="text-xs font-nunito text-craftopia-textSecondary">
                Watch step-by-step guides
              </Text>
            </TouchableOpacity>
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
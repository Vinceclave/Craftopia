// AuthLayout.tsx
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
  return (
    <SafeAreaView className="flex-1 bg-craftopia-light">
      <ScrollView
        className="flex-1 px-6 py-8"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-8">
          <Text className="text-3xl font-poppinsBold text-craftopia-text-primary mb-3 text-start">
            {title}
          </Text>
          <Text className="text-base font-nunito text-craftopia-text-secondary leading-relaxed text-start">
            {subtitle}
          </Text>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AuthLayout;
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
    <SafeAreaView className="flex-1 bg-craftopia-light ">
      <ScrollView className="flex-1 px-5 py-6 pb-20 ">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-craftopia-text-primary mb-2">{title}</Text>
          <Text className="text-craftopia-text-secondary text-base">{subtitle}</Text>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AuthLayout;
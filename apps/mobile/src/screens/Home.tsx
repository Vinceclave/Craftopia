// apps/mobile/src/screens/Home.tsx
import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

export const HomeScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      <View className="flex-1 justify-center items-center">
        <Text className="text-3xl font-bold mb-4">Welcome!</Text>
        {user && (
          <View className="mb-8">
            <Text className="text-lg text-center mb-2">Hello, {user.username}!</Text>
            <Text className="text-gray-600 text-center">{user.email}</Text>
            <Text className="text-sm text-gray-500 text-center mt-2">
              Email verified: {user.is_email_verified ? '✅' : '❌'}
            </Text>
          </View>
        )}
        
        <Button 
          title="Logout" 
          onPress={handleLogout}
          variant="outline"
          fullWidth={false}
        />
      </View>
    </SafeAreaView>
  );
};
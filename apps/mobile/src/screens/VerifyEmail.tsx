import React, { useState } from 'react';
import { SafeAreaView, Text, View, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigations/AuthNavigator';
import { TextInputField } from '../components/common/TextInputField';
import { Button } from '../components/common/Button';
import { authService } from '../services/auth.service';

type VerifyEmailScreenProp = NativeStackNavigationProp<AuthStackParamList, 'VerifyEmail'>;
type VerifyEmailRouteProp = RouteProp<AuthStackParamList, 'VerifyEmail'>;

export const VerifyEmailScreen = () => {
  const navigation = useNavigation<VerifyEmailScreenProp>();
  const route = useRoute<VerifyEmailRouteProp>();
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const email = route.params?.email || '';

  const handleVerifyToken = async () => {
    if (!token.trim()) {
      Alert.alert('Error', 'Please enter the verification token');
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyEmail(token.trim());
      Alert.alert('Success!', 'Email verified successfully.', [
        { text: 'Go to Login', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Invalid or expired token');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      <View className="flex-1 justify-center">
        <Text className="text-6xl text-center mb-4">📧</Text>
        <Text className="text-2xl font-bold text-center mb-4">Verify Your Email</Text>

        {email && (
          <Text className="text-gray-600 text-center mb-6">
            We sent a verification email to{'\n'}
            <Text className="font-semibold">{email}</Text>
          </Text>
        )}

        <View className="bg-blue-50 p-4 rounded-lg mb-6">
          <Text className="text-blue-800 text-sm">
            📱 <Text className="font-semibold">How to verify:</Text>{'\n'}
            1. Check your email inbox{'\n'}
            2. Find the verification email{'\n'}
            3. Copy the verification token{'\n'}
            4. Paste it below and tap "Verify"
          </Text>
        </View>

        <TextInputField
          label="Verification Token"
          placeholder="Paste your token here"
          value={token}
          onChangeText={setToken}
        />

        <Button title="Verify Email" onPress={handleVerifyToken} loading={isLoading} />
        <Button 
          title="Back to Login" 
          onPress={() => navigation.navigate('Login')} 
          variant="outline" 
          disabled={isLoading} 
        />
      </View>
    </SafeAreaView>
  );
};

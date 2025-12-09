// apps/mobile/src/screens/profile/ChangePassword.tsx
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Lock, CheckCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '~/components/common/Button';
import { Input } from '~/components/common/TextInputField';
import { useAlert } from '~/hooks/useAlert';
import { authService } from '~/services/auth.service';

type ChangePasswordNavProp = NativeStackNavigationProp<any, 'ChangePassword'>;

const ChangePasswordScreen = () => {
  const navigation = useNavigation<ChangePasswordNavProp>();
  const { success, error: showError } = useAlert();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate current password
  const validateCurrentPassword = (value: string): boolean => {
    setCurrentPasswordError('');
    
    if (!value.trim()) {
      setCurrentPasswordError('Current password is required');
      return false;
    }
    
    return true;
  };

  // Validate new password
  const validateNewPassword = (value: string): boolean => {
    setNewPasswordError('');
    
    if (!value.trim()) {
      setNewPasswordError('New password is required');
      return false;
    }
    
    if (value.length < 8) {
      setNewPasswordError('Password must be at least 8 characters');
      return false;
    }
    
    if (value === currentPassword) {
      setNewPasswordError('New password must be different from current password');
      return false;
    }
    
    return true;
  };

  // Validate confirm password
  const validateConfirmPassword = (value: string): boolean => {
    setConfirmPasswordError('');
    
    if (!value.trim()) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    
    if (value !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  // Handle current password change
  const handleCurrentPasswordChange = (value: string) => {
    setCurrentPassword(value);
    if (currentPasswordError) {
      validateCurrentPassword(value);
    }
  };

  // Handle new password change
  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    if (newPasswordError) {
      validateNewPassword(value);
    }
    if (confirmPassword) {
      validateConfirmPassword(confirmPassword);
    }
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (confirmPasswordError) {
      validateConfirmPassword(value);
    }
  };

  // Handle password change submission
  const handleChangePassword = async () => {
    const isCurrentValid = validateCurrentPassword(currentPassword);
    const isNewValid = validateNewPassword(newPassword);
    const isConfirmValid = validateConfirmPassword(confirmPassword);

    if (!isCurrentValid || !isNewValid || !isConfirmValid) {
      return;
    }

    setIsLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      
      setIsSuccess(true);
      
      success(
        'Password Changed! 🎉',
        'Your password has been updated successfully. Please use your new password for future logins.',
        () => {
          navigation.goBack();
        }
      );
    } catch (err: any) {
      console.error('❌ [ChangePassword] Failed:', err);
      
      // Handle specific error messages
      let errorMessage = 'Failed to change password. Please try again.';
      
      if (err.message?.toLowerCase().includes('current password')) {
        errorMessage = 'Current password is incorrect. Please try again.';
        setCurrentPasswordError('Incorrect password');
      } else if (err.message?.toLowerCase().includes('unauthorized')) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showError('Change Password Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Success screen
  if (isSuccess) {
    return (
      <SafeAreaView className="flex-1 bg-craftopia-background">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6">
          <View className="flex-1 justify-center items-center py-8">
            <View className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-6">
              <CheckCircle size={48} color="#10B981" strokeWidth={2} />
            </View>
            
            <Text className="text-2xl font-bold text-craftopia-textPrimary text-center mb-2 font-poppinsBold">
              Password Changed!
            </Text>
            
            <Text className="text-craftopia-textSecondary text-center mb-8 px-6 font-nunito">
              Your password has been successfully updated. Use your new password for future logins.
            </Text>
            
            <Button
              title="Back to Profile"
              onPress={() => navigation.goBack()}
              className="w-full"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Change password form
  return (
    <SafeAreaView className="flex-1 bg-craftopia-background">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-craftopia-light">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mr-4"
          disabled={isLoading}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-craftopia-textPrimary font-poppinsBold">
          Change Password
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="px-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 py-6">
          {/* Info Section */}
          <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <Text className="text-craftopia-textPrimary text-sm font-semibold mb-2 font-poppinsBold">
              🔒 Password Security
            </Text>
            <Text className="text-craftopia-textSecondary text-xs leading-relaxed font-nunito">
              Choose a strong password that you don't use for other accounts. Your password must be at least 8 characters long.
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            {/* Current Password */}
            <Input
              label="Current Password"
              placeholder="Enter current password"
              value={currentPassword}
              onChangeText={handleCurrentPasswordChange}
              secureTextEntry={!showCurrentPassword}
              error={currentPasswordError}
              leftIcon={<Lock size={20} color="#6B7280" />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  {showCurrentPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              }
              editable={!isLoading}
            />

            {/* New Password */}
            <Input
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={handleNewPasswordChange}
              secureTextEntry={!showNewPassword}
              error={newPasswordError}
              leftIcon={<Lock size={20} color="#6B7280" />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              }
              editable={!isLoading}
            />

            {/* Confirm New Password */}
            <Input
              label="Confirm New Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              secureTextEntry={!showConfirmPassword}
              error={confirmPasswordError}
              leftIcon={<Lock size={20} color="#6B7280" />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              }
              editable={!isLoading}
            />

            {/* Password Requirements */}
            <View className="bg-craftopia-surface border border-craftopia-light rounded-xl p-4">
              <Text className="text-craftopia-textPrimary text-sm font-semibold mb-2 font-poppinsBold">
                Password Requirements:
              </Text>
              <View className="space-y-1">
                <View className="flex-row items-center">
                  <View className={`w-2 h-2 rounded-full mr-2 ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <Text className={`text-xs font-nunito ${newPassword.length >= 8 ? 'text-green-700' : 'text-craftopia-textSecondary'}`}>
                    At least 8 characters long
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className={`w-2 h-2 rounded-full mr-2 ${newPassword && newPassword !== currentPassword ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <Text className={`text-xs font-nunito ${newPassword && newPassword !== currentPassword ? 'text-green-700' : 'text-craftopia-textSecondary'}`}>
                    Different from current password
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className={`w-2 h-2 rounded-full mr-2 ${confirmPassword && confirmPassword === newPassword ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <Text className={`text-xs font-nunito ${confirmPassword && confirmPassword === newPassword ? 'text-green-700' : 'text-craftopia-textSecondary'}`}>
                    Passwords match
                  </Text>
                </View>
              </View>
            </View>

            {/* Warning */}
            <View className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <Text className="text-amber-800 text-xs font-semibold mb-1 font-poppinsBold">
                ⚠️ Important
              </Text>
              <Text className="text-amber-700 text-xs font-nunito">
                After changing your password, you'll need to use the new password to log in on all devices.
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="space-y-3 mt-4">
              <Button
                title="Change Password"
                onPress={handleChangePassword}
                loading={isLoading}
                disabled={
                  isLoading || 
                  !currentPassword || 
                  !newPassword || 
                  !confirmPassword ||
                  !!currentPasswordError ||
                  !!newPasswordError ||
                  !!confirmPasswordError
                }
              />

              <Button
                title="Cancel"
                onPress={() => navigation.goBack()}
                variant="outline"
                disabled={isLoading}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;
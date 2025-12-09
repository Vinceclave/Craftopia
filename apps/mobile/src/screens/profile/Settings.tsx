import React, { useState } from "react";
import { View, Text, Switch, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  User, 
  Lock, 
  Bell, 
  HelpCircle, 
  Mail, 
  Info,
  FileText,
  Shield,
  RefreshCw,
  CheckCircle
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import * as Updates from 'expo-updates';
import Button from "~/components/common/Button";
import { useAuth } from "~/context/AuthContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "~/navigations/types";

type SettingsItemProps = {
  title: string;
  icon?: React.ComponentType<any>;
  onPress?: () => void;
  showArrow?: boolean;
  rightElement?: React.ReactNode;
};

type Nav = NativeStackNavigationProp<ProfileStackParamList>;


export function SettingsScreen() {
  const { logout } = useAuth();
  const navigation = useNavigation<Nav>();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);

  const SettingsItem: React.FC<SettingsItemProps> = ({ 
    title, 
    icon: Icon, 
    onPress, 
    showArrow = true,
    rightElement 
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between py-3 px-4 border-b border-craftopia-light active:bg-craftopia-light/20"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1">
        {Icon && (
          <View className="w-9 h-9 rounded-lg bg-craftopia-primary/10 items-center justify-center mr-3 border border-craftopia-primary/20">
            <Icon size={16} color="#3B6E4D" />
          </View>
        )}
        <Text className="text-sm font-nunito text-craftopia-textPrimary flex-1">
          {title}
        </Text>
      </View>
      
      {rightElement || (showArrow && <ChevronRight size={16} color="#5F6F64" />)}
    </TouchableOpacity>
  );

  // ✅ Check for OTA updates
  const checkForUpdates = async () => {
    // Skip in development
    if (__DEV__) {
      Alert.alert(
        'Development Mode',
        'Update checks are disabled in development mode. Build a production APK to test OTA updates.'
      );
      return;
    }

    setIsCheckingUpdates(true);

    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        // Show downloading alert
        Alert.alert(
          'Update Available',
          'Downloading the latest version...',
          [{ text: 'OK' }]
        );

        await Updates.fetchUpdateAsync();


        // Show restart prompt
        Alert.alert(
          '🎉 Update Ready',
          'The update has been downloaded. Restart the app to apply the latest improvements.',
          [
            { 
              text: 'Later', 
              style: 'cancel',
              onPress: () => console.log('User postponed update')
            },
            {
              text: 'Restart Now',
              onPress: async () => {
                await Updates.reloadAsync();
              }
            }
          ]
        );
      } else {
        
        Alert.alert(
          'Up to Date ✅',
          'You are using the latest version of Craftopia!'
        );
      }
    } catch (error: any) {
      console.error('❌ Update check failed:', error);
      
      Alert.alert(
        'Update Check Failed',
        'Could not check for updates. Please check your internet connection and try again.'
      );
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  // ✅ Get current update info
  const updateInfo = {
    updateId: Updates.updateId,
    channel: Updates.channel,
    runtimeVersion: Updates.runtimeVersion,
  };

  return (
    <SafeAreaView edges={['left','right']} className="flex-1 bg-craftopia-background">
      {/* Header */}
      <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light">
        <View className="flex-row items-center">
          <Button 
            title=""
            iconOnly
            leftIcon={<ChevronLeft size={16} color="#3B6E4D" />}
            onPress={() => navigation.goBack()}
            className="bg-craftopia-light p-2 mr-3 rounded-lg"
          />
          <View>
            <Text className="text-base font-poppinsBold text-craftopia-textPrimary">Settings</Text>
            <Text className="text-xs font-nunito text-craftopia-textSecondary">Manage your preferences</Text>
          </View>
        </View>
      </View>

      {/* Settings Options */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="px-4 py-3">
          {/* Account Section */}
          <View className="mb-4">
            <Text className="text-xs font-poppinsBold text-craftopia-textSecondary mb-3 uppercase tracking-wider">
              Account
            </Text>

            <View className="bg-craftopia-surface rounded-xl border border-craftopia-light overflow-hidden">
              <SettingsItem 
                title="Edit Profile"
                icon={User}
                onPress={() => navigation.navigate('EditProfile')}  
              />
              
              <SettingsItem 
                title="Change Password"
                icon={Lock}
                onPress={() => navigation.navigate('ChangePassword')}
              />
            </View>
          </View>

          {/* Preferences Section */}
          <View className="mb-4">
            <Text className="text-xs font-poppinsBold text-craftopia-textSecondary mb-3 uppercase tracking-wider">
              Preferences
            </Text>
            
            <View className="bg-craftopia-surface rounded-xl border border-craftopia-light overflow-hidden">
              <View className="flex-row items-center justify-between py-3 px-4 border-b border-craftopia-light">
                <View className="flex-row items-center flex-1">
                  <View className="w-9 h-9 rounded-lg bg-craftopia-primary/10 items-center justify-center mr-3 border border-craftopia-primary/20">
                    <Bell size={16} color="#3B6E4D" />
                  </View>
                  <Text className="text-sm font-nunito text-craftopia-textPrimary flex-1">
                    Notifications
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#E8ECE8', true: '#3B6E4D' }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#E8ECE8"
                />
              </View>
            </View>
          </View>

          {/* ✅ NEW: App Updates Section */}
          <View className="mb-4">
            <Text className="text-xs font-poppinsBold text-craftopia-textSecondary mb-3 uppercase tracking-wider">
              App Updates
            </Text>
            
            <View className="bg-craftopia-surface rounded-xl border border-craftopia-light p-4">
              {/* Header */}
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full bg-craftopia-primary/10 items-center justify-center mr-3">
                  <RefreshCw size={20} color="#3B6E4D" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-poppinsBold text-craftopia-textPrimary">
                    Keep Craftopia Updated
                  </Text>
                  <Text className="text-xs text-craftopia-textSecondary font-nunito">
                    Get the latest features and fixes
                  </Text>
                </View>
              </View>

              {/* Update Info (only in production) */}
              {!__DEV__ && updateInfo.updateId && (
                <View className="bg-craftopia-light/50 rounded-xl p-3 mb-3">
                  <View className="flex-row items-center mb-2">
                    <Info size={12} color="#5F6F64" />
                    <Text className="text-xs text-craftopia-textSecondary ml-2 font-nunito font-semibold">
                      Current Version
                    </Text>
                  </View>
                  
                  <Text className="text-xs text-craftopia-textSecondary font-nunito mb-1">
                    Update: {updateInfo.updateId.substring(0, 8)}...
                  </Text>
                  
                  {updateInfo.channel && (
                    <Text className="text-xs text-craftopia-textSecondary font-nunito">
                      Channel: {updateInfo.channel}
                    </Text>
                  )}
                </View>
              )}

              {/* Development Mode Notice */}
              {__DEV__ && (
                <View className="bg-yellow-50 rounded-xl p-3 mb-3 border border-yellow-200">
                  <Text className="text-xs text-yellow-800 font-nunito">
                    ⚠️ Development Mode: Update checks are disabled. Build a production APK to test OTA updates.
                  </Text>
                </View>
              )}

              {/* Check for Updates Button */}
              <TouchableOpacity
                onPress={checkForUpdates}
                disabled={isCheckingUpdates}
                className={`flex-row items-center justify-center py-3 rounded-xl ${
                  isCheckingUpdates ? 'bg-craftopia-primary/50' : 'bg-craftopia-primary'
                }`}
                activeOpacity={0.7}
              >
                {isCheckingUpdates ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text className="text-white font-nunito font-semibold ml-2">
                      Checking...
                    </Text>
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} color="#FFFFFF" />
                    <Text className="text-white font-nunito font-semibold ml-2">
                      Check for Updates
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Support Section */}
          <View className="mb-4">
            <Text className="text-xs font-poppinsBold text-craftopia-textSecondary mb-3 uppercase tracking-wider">
              Support
            </Text>

            <View className="bg-craftopia-surface rounded-xl border border-craftopia-light overflow-hidden">
              <SettingsItem 
                title="Help Center"
                icon={HelpCircle}
                onPress={() => navigation.navigate('HelpCenter')}
              />
              
              <SettingsItem 
                title="Contact Us"
                icon={Mail}
                onPress={() => navigation.navigate('ContactUs')}
              />
              
              <SettingsItem 
                title="About"
                icon={Info}
                onPress={() => navigation.navigate('AboutUs')}
              />
            </View>
          </View>

          {/* Legal Section */}
          <View className="mb-4">
            <Text className="text-xs font-poppinsBold text-craftopia-textSecondary mb-3 uppercase tracking-wider">
              Legal
            </Text>

            <View className="bg-craftopia-surface rounded-xl border border-craftopia-light overflow-hidden">
              <SettingsItem 
                title="Privacy Policy"
                icon={FileText}
                onPress={() => navigation.navigate('PrivacyPolicy')}
              />
              
              <SettingsItem 
                title="Terms of Service"
                icon={Shield}
                onPress={() => navigation.navigate('TermsOfService')}
              />
            </View>
          </View>

          {/* App Info */}
          <View className="bg-craftopia-surface rounded-xl border border-craftopia-light p-3 mb-4">
            <Text className="text-xs font-nunito text-craftopia-textSecondary mb-1">
              App Version
            </Text>
            <Text className="text-sm font-poppinsBold text-craftopia-textPrimary">
              Craftopia v1.0.0
            </Text>
            
            {/* ✅ Show runtime version in production */}
            {!__DEV__ && updateInfo.runtimeVersion && (
              <Text className="text-xs font-nunito text-craftopia-textSecondary mt-1">
                Runtime: {updateInfo.runtimeVersion}
              </Text>
            )}
          </View>

          {/* Logout Button */}
          <Button 
            onPress={() => logout()}
            title="Log Out"
            leftIcon={<LogOut size={16} color="#FFFFFF" />}
            variant="primary"
            className="mt-2 rounded-lg"
            size="lg"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
import React from "react";
import { View, Text, Switch, ScrollView, TouchableOpacity } from "react-native";
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
  Shield
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import Button from "~/components/common/Button";
import { useAuth } from "~/context/AuthContext";

type SettingsItemProps = {
  title: string;
  icon?: React.ComponentType<any>;
  onPress?: () => void;
  showArrow?: boolean;
  rightElement?: React.ReactNode; // ✅ optional now
};

export function SettingsScreen() {
  const { logout } = useAuth();
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const SettingsItem: React.FC<SettingsItemProps> = ({ 
    title, 
    icon: Icon, 
    onPress, 
    showArrow = true,
    rightElement 
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between py-2.5 px-4 border-b border-craftopia-light/50 last:border-b-0"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1">
        {Icon && (
          <View className="w-8 h-8 rounded-lg bg-craftopia-primary/10 items-center justify-center mr-3">
            <Icon size={14} color="#374A36" />
          </View>
        )}
        <Text className="text-sm text-craftopia-textPrimary font-medium flex-1">
          {title}
        </Text>
      </View>
      
      {rightElement || (showArrow && <ChevronRight size={14} color="#5D6B5D" />)}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={['left','right']} className="flex-1 bg-craftopia-light">
      {/* Header */}
      <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light/30">
        <View className="flex-row items-center">
          <Button 
            title=""
            iconOnly
            leftIcon={<ChevronLeft size={16} color="#1D261D" />}
            onPress={() => navigation.goBack()}
            className="bg-transparent p-1 mr-2"
          />
          <View>
            <Text className="text-sm font-semibold text-craftopia-textPrimary">Settings</Text>
            <Text className="text-xs text-craftopia-textSecondary">Manage your account</Text>
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
          <View className="mb-5">
            <Text className="text-xs font-medium text-craftopia-textSecondary mb-3 uppercase tracking-wider">
              Account
            </Text>

            <View className="bg-craftopia-surface rounded-lg border border-craftopia-light/50 overflow-hidden">
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
          <View className="mb-5">
            <Text className="text-xs font-medium text-craftopia-textSecondary mb-3 uppercase tracking-wider">
              Preferences
            </Text>
            
            <View className="bg-craftopia-surface rounded-lg border border-craftopia-light/50 overflow-hidden">
              <View className="flex-row items-center justify-between py-2.5 px-4">
                <View className="flex-row items-center flex-1">
                  <View className="w-8 h-8 rounded-lg bg-craftopia-primary/10 items-center justify-center mr-3">
                    <Bell size={14} color="#374A36" />
                  </View>
                  <Text className="text-sm text-craftopia-textPrimary font-medium flex-1">
                    Notifications
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#F2F4F3', true: '#374A36' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>

          {/* Support Section */}
          <View className="mb-5">
            <Text className="text-xs font-medium text-craftopia-textSecondary mb-3 uppercase tracking-wider">
              Support
            </Text>

            <View className="bg-craftopia-surface rounded-lg border border-craftopia-light/50 overflow-hidden">
              <SettingsItem 
                title="Help Center"
                icon={HelpCircle}
                onPress={() => navigation.navigate('HelpCenter')}
              />
              
              <SettingsItem 
                title="Contact Us"
                icon={Mail}
                onPress={() => navigation.navigate('Contact')}
              />
              
              <SettingsItem 
                title="About"
                icon={Info}
                onPress={() => navigation.navigate('About')}
              />
            </View>
          </View>

          {/* Legal Section */}
          <View className="mb-5">
            <Text className="text-xs font-medium text-craftopia-textSecondary mb-3 uppercase tracking-wider">
              Legal
            </Text>

            <View className="bg-craftopia-surface rounded-lg border border-craftopia-light/50 overflow-hidden">
              <SettingsItem 
                title="Privacy Policy"
                icon={FileText}
                onPress={() => navigation.navigate('PrivacyPolicy')}
              />
              
              <SettingsItem 
                title="Terms of Service"
                icon={Shield}
                onPress={() => navigation.navigate('Terms')}
              />
            </View>
          </View>

          {/* App Info */}
          <View className="bg-craftopia-surface rounded-lg border border-craftopia-light/50 p-3 mb-5">
            <Text className="text-xs font-medium text-craftopia-textSecondary mb-1">
              App Version
            </Text>
            <Text className="text-sm text-craftopia-textPrimary">
              Craftopia v1.0.0
            </Text>
          </View>

          {/* Logout Button */}
          <Button 
            onPress={() => logout()}
            title="Log Out"
            leftIcon={<LogOut size={16} color="#FFFFFF" />}
            variant="primary"
            className="mt-2"
            size="md"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

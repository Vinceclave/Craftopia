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
  rightElement?: React.ReactNode;
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
                onPress={() => navigation.navigate('Terms')}
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
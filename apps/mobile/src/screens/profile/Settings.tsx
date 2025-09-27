import React from "react";
import { View, Text, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import Button from "~/components/common/Button";
import { useAuth } from "~/context/AuthContext";

export function SettingsScreen() {
  const { logout } = useAuth();
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  return (
    <SafeAreaView className="flex-1 bg-craftopia-light">
      {/* Header */}
      <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light">
        <View className="flex-row items-center">
          <Button 
            title=""
            iconOnly
            leftIcon={<ChevronLeft size={16} color="#1D261D" />}
            onPress={() => navigation.goBack()}
            className="bg-transparent p-1 mr-2"
          />
          <Text className="text-sm font-semibold text-craftopia-textPrimary">Settings</Text>
        </View>
      </View>

      {/* Settings Options */}
      <View className="flex-1 px-4 py-3">
        {/* Account Section */}
        <View className="mb-6">
          <Text className="text-xs font-medium text-craftopia-textSecondary mb-2 uppercase tracking-wide">
            Account
          </Text>

          <Button 
            title="Edit Profile"
            rightIcon={<ChevronRight size={16} color="#5D6B5D" />}
            variant="outline"
            className="justify-between border-b border-craftopia-light rounded-none"
            textClassName="text-craftopia-textPrimary text-sm font-normal"
            onPress={() => {/* Navigate to edit profile */}}
          />
          
          <Button 
            title="Change Password"
            rightIcon={<ChevronRight size={16} color="#5D6B5D" />}
            variant="outline"
            className="justify-between border-b border-craftopia-light rounded-none"
            textClassName="text-craftopia-textPrimary text-sm font-normal"
            onPress={() => {/* Navigate to change password */}}
          />
        </View>

        {/* Preferences Section */}
        <View className="mb-6">
          <Text className="text-xs font-medium text-craftopia-textSecondary mb-2 uppercase tracking-wide">
            Preferences
          </Text>
          
          <View className="flex-row items-center justify-between py-3 border-b border-craftopia-light">
            <Text className="text-sm text-craftopia-textPrimary">Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#F2F4F3', true: '#374A36' }}
              thumbColor={notificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Support Section */}
        <View className="mb-6">
          <Text className="text-xs font-medium text-craftopia-textSecondary mb-2 uppercase tracking-wide">
            Support
          </Text>

          <Button 
            title="Help Center"
            rightIcon={<ChevronRight size={16} color="#5D6B5D" />}
            variant="outline"
            className="justify-between border-b border-craftopia-light rounded-none"
            textClassName="text-craftopia-textPrimary text-sm font-normal"
            onPress={() => {/* Navigate to help center */}}
          />
          
          <Button 
            title="Contact Us"
            rightIcon={<ChevronRight size={16} color="#5D6B5D" />}
            variant="outline"
            className="justify-between border-b border-craftopia-light rounded-none"
            textClassName="text-craftopia-textPrimary text-sm font-normal"
            onPress={() => {/* Navigate to contact */}}
          />
          
          <Button 
            title="About"
            rightIcon={<ChevronRight size={16} color="#5D6B5D" />}
            variant="outline"
            className="justify-between border-b border-craftopia-light rounded-none"
            textClassName="text-craftopia-textPrimary text-sm font-normal"
            onPress={() => {/* Navigate to about */}}
          />
        </View>

        {/* Logout Button */}
        <Button 
          onPress={() => logout()}
          title="Logout"
          leftIcon={<LogOut size={16} color="#FFFFFF" />}
          variant="primary"
          className="mt-4"
        />
      </View>
    </SafeAreaView>
  );
}
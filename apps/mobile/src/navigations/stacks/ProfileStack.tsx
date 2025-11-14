import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import { ProfileScreen } from "~/screens/Profile";
import { SettingsScreen } from "~/screens/profile/Settings";
import { EditProfileScreen } from "~/screens/profile/EditProfile";

// Add these imports if you already created the screens
import { ChangePasswordScreen } from "~/screens/profile/ChangePassword";
import { HelpCenterScreen } from "~/screens/profile/HelpCenter";
import { ContactUsScreen } from "~/screens/profile/ContactUs";
import { AboutUsScreen } from "~/screens/profile/AboutUs";
import { PrivacyPolicyScreen } from "~/screens/profile/PrivacyPolicy";
import { TermsOfServiceScreen } from "~/screens/profile/TermsOfService";

import { ProfileStackParamList } from "../types";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, 
      }}
    >
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "My Profile" }}
      />

      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />

      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: "Edit Profile" }}
      />

      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: "Change Password" }}
      />

      <Stack.Screen
        name="HelpCenter"
        component={HelpCenterScreen}
        options={{ title: "Help Center" }}
      />

      <Stack.Screen
        name="ContactUs"
        component={ContactUsScreen}
        options={{ title: "Contact Us" }}
      />

      <Stack.Screen
        name="AboutUs"
        component={AboutUsScreen}
        options={{ title: "About Us" }}
      />

      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ title: "Privacy Policy" }}
      />

      <Stack.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{ title: "Terms of Service" }}
      />
    </Stack.Navigator>
  );
}

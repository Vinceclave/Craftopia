import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Animated, { Easing } from "react-native-reanimated";

import { ProfileScreen } from "~/screens/Profile";
import { SettingsScreen } from "~/screens/profile/Settings";
import { EditProfileScreen } from "~/screens/profile/EditProfile";
import ChangePasswordScreen from "~/screens/profile/ChangePassword";
import { HelpCenterScreen } from "~/screens/profile/HelpCenter";
import { ContactUsScreen } from "~/screens/profile/ContactUs";
import { AboutUsScreen } from "~/screens/profile/AboutUs";
import { PrivacyPolicyScreen } from "~/screens/profile/PrivacyPolicy";
import { TermsOfServiceScreen } from "~/screens/profile/TermsOfService";

import { ProfileStackParamList } from "../types";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      {/* 1️⃣ Profile — Fade */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          animation: "fade",
        }}
      />

      {/* 2️⃣ Settings — Smooth slide from right */}
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          animationDuration: 300,
          animation: "slide_from_right",
        }}
      />

      {/* 3️⃣ Edit Profile — Bottom sheet (spring) */}
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          animation: "slide_from_bottom",
          animationDuration: 450,
        }}
      />

      {/* 4️⃣ Change Password — Slide + Fade */}
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          animation: "slide_from_left",
          animationDuration: 350,
        }}
      />

      {/* 5️⃣ Help Center — Zoom in */}
      <Stack.Screen
        name="HelpCenter"
        component={HelpCenterScreen}
        options={{
          presentation: "transparentModal",
          animation: "fade",
        }}
      />

      {/* 6️⃣ Contact Us — Elastic drop from top */}
      <Stack.Screen
        name="ContactUs"
        component={ContactUsScreen}
      />

      {/* 7️⃣ About Us — Flip animation */}
      <Stack.Screen
        name="AboutUs"
        component={AboutUsScreen}
        options={{
          animation: "flip",
        }}
      />

      {/* 8️⃣ Privacy Policy — Scale + Fade */}
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          presentation: "transparentModal",
          animation: "fade",
        }}
      />

      {/* 9️⃣ Terms of Service — Slide up + overshoot */}
      <Stack.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{
          animation: "slide_from_bottom",
          animationDuration: 420,
        }}
      />
    </Stack.Navigator>
  );
}

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

export function SettingsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Custom Back Button */}
      <View className="flex-row items-center p-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="flex-row items-center"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
          <Text className="ml-2 text-lg font-medium">Back</Text>
        </TouchableOpacity>
      </View>

      {/* Screen Content */}
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-semibold">Settings Screen</Text>
      </View>
    </SafeAreaView>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Camera } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { authService } from '~/services/auth.service';
import Button from '~/components/common/Button';
import Input from "~/components/common/TextInputField";

interface UserProfile {
  username?: string;
  full_name?: string;
  bio?: string;
  location?: string;
  profile_picture_url?: string;
}

export function EditProfileScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: '',
    full_name: '',
    bio: '',
    location: '',
    profile_picture_url: '🧑‍🎨'
  });

  // Refs for input navigation
  const usernameRef = useRef<TextInput>(null);
  const bioRef = useRef<TextInput>(null);
  const locationRef = useRef<TextInput>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const user: any = await authService.getCurrentUser();
        
        // Only update if we actually have new data
        const newProfile = {
          username: user.username || userProfile.username,
          full_name: user.profile?.full_name || userProfile.full_name,
          bio: user.profile?.bio || userProfile.bio,
          location: user.profile?.location || userProfile.location,
          profile_picture_url: user.profile?.profile_picture_url || userProfile.profile_picture_url
        };
        
        setUserProfile(newProfile);
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Add your save profile logic here
      // await authService.updateProfile(userProfile);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="flex-row items-center"
        >
          <ChevronLeft size={24} color="#333" />
          <Text className="ml-1 text-base font-medium">Back</Text>
        </TouchableOpacity>

        <Text className="text-lg font-semibold">Edit Profile</Text>

        <TouchableOpacity 
          onPress={handleSave}
          disabled={loading}
        >
          <Text className="text-base font-semibold text-blue-600">
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Avatar */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-2 relative">
            <Text className="text-3xl">{userProfile.profile_picture_url}</Text>
            <TouchableOpacity 
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full items-center justify-center"
            >
              <Camera size={12} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-sm text-gray-500">Change Photo</Text>
        </View>

        {/* Form */}
        <View className="space-y-6">
          <Input
            label="Name"
            value={userProfile.full_name}
            onChangeText={(text) => handleInputChange('full_name', text)}
            placeholder="Your full name"
            nextInputRef={usernameRef}
          />

          <Input
            ref={usernameRef}
            label="Username"
            value={userProfile.username}
            onChangeText={(text) => handleInputChange('username', text)}
            placeholder="@username"
            nextInputRef={bioRef}
          />

          <Input
            ref={bioRef}
            label="Bio"
            value={userProfile.bio}
            onChangeText={(text) => handleInputChange('bio', text)}
            placeholder="Tell us about yourself..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            nextInputRef={locationRef}
          />

          <Input
            ref={locationRef}
            label="Location"
            value={userProfile.location}
            onChangeText={(text) => handleInputChange('location', text)}
            placeholder="Where are you based?"
            isLastInput
            onSubmit={handleSave}
          />
        </View>

        {/* Save Button */}
        <View className="mt-8">
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={loading}
            size="lg"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Camera, User, Mail, MapPin, FileText, Edit3 } from "lucide-react-native";
import Button from '~/components/common/Button';
import Input from "~/components/common/TextInputField";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "~/context/AuthContext";
import { apiService } from "~/services/base.service";

interface UserProfile {
  name?: string;
  email: string;
  username: string;
  bio?: string;
  location?: string;
  avatar?: string;
}

export function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    name: user?.profile?.full_name,
    email: user?.email || '',
    username: user?.username || '',
    bio: user?.profile?.bio,
    location: user?.profile?.location,
    avatar: user?.profile?.profile_picture_url,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        full_name: profile.name,
        bio: profile.bio,
        location: profile.location,
      };

      // Send PUT request to update profile
      const updatedData = await apiService.request('/api/v1/users/profile', {
        method: 'PUT',
        data: payload,
      });

      // Update AuthContext.user immediately
      if (setUser && user) {
        setUser({
          ...user,
          profile: {
            ...user.profile,
            full_name: profile.name,
            bio: profile.bio,
            location: profile.location,
          },
        });
      }

      // Show alert, navigate after user taps OK
      Alert.alert(
        'Success',
        'Profile updated successfully! ✅',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(), // navigate after alert
          },
        ]
      );
    } catch (error: any) {
      console.error('Failed to update profile:', error.message);
      Alert.alert('Error', error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F0F0F0' }}>
      {/* Background Shapes */}
      <View className="absolute inset-0 overflow-hidden">
        <View className="absolute -top-32 -right-32 w-64 h-64 rounded-full opacity-4" style={{ backgroundColor: '#004E98' }} />
        <View className="absolute top-80 -left-24 w-48 h-48 rounded-full opacity-3" style={{ backgroundColor: '#7C9885' }} />
      </View>

      <ScrollView
        className="flex-1 relative z-10"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="px-6 pt-12 pb-8">
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center">
              <ChevronLeft size={24} color="#004E98" strokeWidth={2.5} />
              <Text className="ml-2 text-lg font-semibold" style={{ color: '#004E98' }}>Back</Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View className="mb-8">
            <View className="flex-row items-center mb-2">
              <View className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#004E98' }} />
              <Text className="text-sm font-semibold tracking-wider uppercase" style={{ color: '#333333' }}>Edit Profile</Text>
            </View>
            <Text className="text-4xl font-black tracking-tight mb-3" style={{ color: '#004E98' }}>Update Your Info</Text>
            <View className="flex-row items-center">
              <Edit3 size={18} color="#7C9885" />
              <Text className="text-lg font-semibold ml-2" style={{ color: '#333333' }}>Make changes to your profile</Text>
            </View>
          </View>

          {/* Avatar */}
          <View className="bg-white rounded-2xl p-6 mb-6 items-center" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)' }}>
            <View className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: '#004E98' }} />
            <View className="w-20 h-20 rounded-2xl items-center justify-center mb-3 relative" style={{ backgroundColor: '#004E9812' }}>
              <Text className="text-3xl">🧑‍🎨</Text>
              <TouchableOpacity className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl items-center justify-center" style={{ backgroundColor: '#FF6700' }}>
                <Camera size={14} color="white" />
              </TouchableOpacity>
            </View>
            <Text className="text-sm font-bold" style={{ color: '#7C9885' }}>Change Photo</Text>
          </View>
        </View>

        {/* Form Sections */}
        <View className="px-6">
          {/* Personal Details */}
          <View className="mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: '#004E9812' }}>
                <User size={16} color="#004E98" />
              </View>
              <Text className="text-xl font-black" style={{ color: '#004E98' }}>Personal Details</Text>
            </View>
            <View className="space-y-4">
              <Input label="Full Name" value={profile.name} placeholder="Enter your full name" onChangeText={text => handleInputChange('name', text)} />
              <Input label="Username" value={profile.username} placeholder="Choose a unique username" editable={false} />
            </View>
          </View>

          {/* About */}
          <View className="mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: '#00A89612' }}>
                <FileText size={16} color="#00A896" />
              </View>
              <Text className="text-xl font-black" style={{ color: '#004E98' }}>About You</Text>
            </View>
            <Input label="Bio" placeholder="Tell us about yourself..." value={profile.bio} onChangeText={text => handleInputChange('bio', text)} multiline numberOfLines={4} textAlignVertical="top" />
          </View>

          {/* Location */}
          <View className="mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: '#FF670012' }}>
                <MapPin size={16} color="#FF6700" />
              </View>
              <Text className="text-xl font-black" style={{ color: '#004E98' }}>Location</Text>
            </View>
            <Input label="Location" placeholder="Where are you based?" value={profile.location} onChangeText={text => handleInputChange('location', text)} />
          </View>

          {/* Email Info */}
          <View className="bg-white rounded-2xl p-5 mb-6" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)' }}>
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: '#7C988512' }}>
                <Mail size={16} color="#7C9885" />
              </View>
              <Text className="text-base font-bold" style={{ color: '#004E98' }}>Account Email</Text>
            </View>
            <Text className="text-base font-medium mb-2" style={{ color: '#004E98' }}>{profile.email}</Text>
            <Text className="text-sm font-medium" style={{ color: '#333333' }}>Email cannot be changed here. Contact support if needed.</Text>
          </View>

          {/* Save Button */}
          <View className="mb-8">
            <Button onPress={handleSave} title={loading ? 'Saving...' : 'Save Changes'} size="lg" variant="primary" disabled={loading} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

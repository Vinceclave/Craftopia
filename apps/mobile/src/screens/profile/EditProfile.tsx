// apps/mobile/src/screens/profile/EditProfile.tsx - Optimized Version
import React, { useState, useCallback, useMemo } from "react";
import { View, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from '~/components/common/Button';
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "~/context/AuthContext";
import { apiService } from "~/services/base.service";
import { useAlert } from '~/hooks/useAlert';

// Import the divided components
import { EditProfileHeader } from "~/components/profile/edit/EditProfileHeader";
import { AvatarSection } from "~/components/profile/edit/AvatarSection";
import { PersonalDetailsForm } from "~/components/profile/edit/PersonalDetailsForm";
import { BioForm } from "~/components/profile/edit/BioForm";
import { EmailInfo } from "~/components/profile/edit/EmailInfo";

interface UserProfile {
  name: string;
  email: string;
  username: string;
  bio: string;
  avatar: string;
}

// Validation constants
const VALIDATION_RULES = {
  NAME_MAX_LENGTH: 100,
  BIO_MAX_LENGTH: 500,
} as const;

// Validation utility
const validateProfile = (profile: UserProfile) => {
  if (!profile.name.trim()) {
    return { isValid: false, error: 'Full name is required' };
  }
  if (profile.name.length > VALIDATION_RULES.NAME_MAX_LENGTH) {
    return { isValid: false, error: `Full name cannot exceed ${VALIDATION_RULES.NAME_MAX_LENGTH} characters` };
  }
  if (profile.bio.length > VALIDATION_RULES.BIO_MAX_LENGTH) {
    return { isValid: false, error: `Bio cannot exceed ${VALIDATION_RULES.BIO_MAX_LENGTH} characters` };
  }
  return { isValid: true };
};

export function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, setUser } = useAuth();
  const { success, error } = useAlert();
  const [loading, setLoading] = useState(false);

  // Memoized initial profile state
  const initialProfile = useMemo((): UserProfile => ({
    name: user?.profile?.full_name || '',
    email: user?.email || '',
    username: user?.username || '',
    bio: user?.profile?.bio || '',
    avatar: user?.profile?.profile_picture_url || '🧑‍🎨',
  }), [user]);

  const [profile, setProfile] = useState<UserProfile>(initialProfile);

  // Memoized change detection
  const hasChanges = useMemo(() => {
    return profile.name !== initialProfile.name || profile.bio !== initialProfile.bio;
  }, [profile.name, profile.bio, initialProfile.name, initialProfile.bio]);

  // Memoized validation
  const validation = useMemo(() => validateProfile(profile), [profile]);

  // Callback handlers to prevent re-renders
  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSave = useCallback(async () => {
    if (!validation.isValid) {
      error('Validation Error', validation.error!);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        full_name: profile.name.trim(),
        bio: profile.bio.trim() || null,
      };

      await apiService.request('/api/v1/users/profile', {
        method: 'PUT',
        data: payload,
      });

      // Update AuthContext optimistically
      if (setUser && user) {
        setUser(prev => ({
          ...prev!,
          profile: {
            ...prev!.profile,
            full_name: payload.full_name,
            bio: payload.bio,
          },
        }));
      }

      success('Success', 'Profile updated successfully!', () => {
        navigation.goBack();
      });
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Something went wrong.';
      error('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [validation, profile, error, setUser, user, success, navigation]);

  const handleAvatarPress = useCallback(() => {
    console.log('Avatar pressed - implement image picker');
    // TODO: Implement image picker functionality
  }, []);

  const handleNameChange = useCallback((text: string) => {
    setProfile(prev => ({ ...prev, name: text }));
  }, []);

  const handleBioChange = useCallback((text: string) => {
    setProfile(prev => ({ ...prev, bio: text }));
  }, []);

  // Memoized save button state
  const canSave = hasChanges && validation.isValid && !loading;

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-gray-50">
      <EditProfileHeader 
        onBackPress={handleBackPress}
        onSavePress={handleSave}
        loading={loading}
        hasChanges={hasChanges}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={scrollViewStyle}
        keyboardShouldPersistTaps="handled"
      >
        <AvatarSection 
          avatar={profile.avatar}
          onAvatarPress={handleAvatarPress}
        />

        <PersonalDetailsForm 
          name={profile.name}
          username={profile.username}
          onNameChange={handleNameChange}
        />

        <BioForm 
          bio={profile.bio}
          onBioChange={handleBioChange}
          characterLimit={VALIDATION_RULES.BIO_MAX_LENGTH}
        />

        <EmailInfo email={profile.email} />

        {/* Save Button */}
        <View className="mx-4 mt-6">
          <Button 
            onPress={handleSave} 
            title={loading ? 'Saving...' : 'Save Changes'} 
            size="lg" 
            variant="primary" 
            disabled={!canSave}
            loading={loading}
          />
          {!hasChanges && !loading && (
            <Text className="text-center text-sm text-gray-500 mt-2">
              No changes to save
            </Text>
          )}
          {!validation.isValid && (
            <Text className="text-center text-sm text-red-500 mt-2">
              {validation.error}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Memoized style object
const scrollViewStyle = { paddingBottom: 120 };
// EditProfileScreen.tsx - Updated with your colors
import React, { useState, useCallback, useMemo } from "react";
import { View, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import Button from '~/components/common/Button';
import { useAuth } from "~/context/AuthContext";
import { apiService } from "~/services/base.service";
import { useAlert } from '~/hooks/useAlert';

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

const VALIDATION_RULES = {
  NAME_MAX_LENGTH: 100,
  BIO_MAX_LENGTH: 500,
} as const;

const validateProfile = (profile: UserProfile) => {
  if (!profile.name.trim()) return { isValid: false, error: 'Full name is required' };
  if (profile.name.length > VALIDATION_RULES.NAME_MAX_LENGTH)
    return { isValid: false, error: `Full name cannot exceed ${VALIDATION_RULES.NAME_MAX_LENGTH} characters` };
  if (profile.bio.length > VALIDATION_RULES.BIO_MAX_LENGTH)
    return { isValid: false, error: `Bio cannot exceed ${VALIDATION_RULES.BIO_MAX_LENGTH} characters` };
  return { isValid: true };
};

export function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, setUser } = useAuth();
  const { success, error } = useAlert();
  const [loading, setLoading] = useState(false);

  const initialProfile = useMemo<UserProfile>(() => ({
    name: user?.profile?.full_name || '',
    email: user?.email || '',
    username: user?.username || '',
    bio: user?.profile?.bio || '',
    avatar: user?.profile?.profile_picture_url || '🧑‍🎨',
  }), [user]);

  const [profile, setProfile] = useState<UserProfile>(initialProfile);

  const hasChanges = useMemo(() => (
    profile.name !== initialProfile.name || 
    profile.bio !== initialProfile.bio ||
    profile.avatar !== initialProfile.avatar
  ), [profile, initialProfile]);

  const validation = useMemo(() => validateProfile(profile), [profile]);

  const handleBackPress = useCallback(() => navigation.goBack(), [navigation]);

  const handleSave = useCallback(async () => {
    if (!validation.isValid) return error('Validation Error', validation.error!);

    setLoading(true);
    try {
      const payload = { 
        full_name: profile.name.trim(), 
        bio: profile.bio.trim() || null,
        profile_picture_url: profile.avatar.startsWith('http') ? profile.avatar : null
      };

      const response = await apiService.request('/api/v1/users/profile', { 
        method: 'PUT', 
        data: payload 
      });

      if (setUser && user) {
        setUser(prev => ({
          ...prev!,
          profile: { 
            ...prev!.profile, 
            full_name: payload.full_name, 
            bio: payload.bio,
            profile_picture_url: payload.profile_picture_url
          },
        }));
      }

      success('Success', 'Profile updated successfully!', () => navigation.goBack());
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Something went wrong.';
      error('Error', msg);
    } finally { 
      setLoading(false); 
    }
  }, [validation, profile, error, setUser, user, success, navigation]);

  const handleAvatarChange = useCallback((url?: string) => {
    setProfile(p => ({ ...p, avatar: url || '🧑‍🎨' }));
  }, []);

  const handleNameChange = useCallback((text: string) => setProfile(p => ({ ...p, name: text })), []);
  const handleBioChange = useCallback((text: string) => setProfile(p => ({ ...p, bio: text })), []);

  const canSave = hasChanges && validation.isValid && !loading;

  return (
    <SafeAreaView edges={['left','right']} className="flex-1 bg-craftopia-light">
      <EditProfileHeader onBackPress={handleBackPress} />
      
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <AvatarSection avatar={profile.avatar} onChange={handleAvatarChange} />
        
        <PersonalDetailsForm
          name={profile.name}
          username={profile.username}
          onNameChange={handleNameChange}
        />
        
        <BioForm bio={profile.bio} onBioChange={handleBioChange} characterLimit={VALIDATION_RULES.BIO_MAX_LENGTH} />
        
        <EmailInfo email={profile.email} />

        <View className="mx-4 mt-4">
          <Button
            onPress={handleSave}
            title={loading ? 'Saving...' : 'Save Changes'}
            size="md"
            disabled={!canSave}
            loading={loading}
          />
          
          {!hasChanges && !loading && (
            <Text className="text-center text-xs text-craftopia-textSecondary mt-2">No changes to save</Text>
          )}
          
          {!validation.isValid && (
            <Text className="text-center text-xs text-red-500 mt-2">{validation.error}</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
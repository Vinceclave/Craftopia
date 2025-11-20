// apps/mobile/src/hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '~/services/auth.service';
import { userService } from '~/services/user.service';
import { useAuth } from '~/context/AuthContext';
import { useAlert } from './useAlert';

export const useProfile = () => {
  const queryClient = useQueryClient();
  const { user: authUser, setUser } = useAuth();
  const { success, error: showError } = useAlert();

  // Fetch user profile
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const user = await authService.getCurrentUser();
      return user;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: {
      full_name?: string;
      bio?: string;
      profile_picture_url?: string;
      location?: string;
    }) => {
      return await userService.updateProfile(updates);
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(['user-profile'], data);
      
      // Update auth context
      if (setUser) {
        setUser((prev: any) => ({
          ...prev,
          profile: data.profile,
        }));
      }
      
      success('Profile Updated', 'Your profile has been updated successfully.');
    },
    onError: (error: any) => {
      showError('Update Failed', error.message || 'Failed to update profile');
    },
  });

  // Update profile photo specifically
  const updateProfilePhoto = async (photoUrl: string) => {
    return updateProfileMutation.mutateAsync({
      profile_picture_url: photoUrl,
    });
  };

  return {
    profile: profile || authUser,
    isLoading,
    error,
    refetch,
    updateProfile: updateProfileMutation.mutate,
    updateProfileAsync: updateProfileMutation.mutateAsync,
    updateProfilePhoto,
    isUpdating: updateProfileMutation.isPending,
  };
};
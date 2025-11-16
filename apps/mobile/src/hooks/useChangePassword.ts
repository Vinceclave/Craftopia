// apps/mobile/src/hooks/useChangePassword.ts
import { useMutation } from '@tanstack/react-query';
import { authService } from '~/services/auth.service';

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: ChangePasswordData) =>
      authService.changePassword(currentPassword, newPassword),
    onSuccess: (response) => {
      console.log('✅ [useChangePassword] Password changed:', response.message);
    },
    onError: (error: any) => {
      console.error('❌ [useChangePassword] Failed:', error.message);
    },
  });
};
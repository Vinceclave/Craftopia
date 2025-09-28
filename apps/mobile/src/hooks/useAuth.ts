import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '~/services/auth.service';
import { LoginRequest, RegisterRequest, User } from '~/config/api';

// Query keys
export const authKeys = {
  user: ['auth', 'user'] as const,
  status: ['auth', 'status'] as const,
};

// Auth status query
export const useAuthStatus = () => {
  return useQuery({
    queryKey: authKeys.status,
    queryFn: async () => {
      const hasToken = await authService.hasValidToken();
      return { isAuthenticated: hasToken };
    },
    staleTime: Infinity, // Never becomes stale
    gcTime: Infinity, // Never garbage collected
  });
};

// Current user query
export const useCurrentUser = () => {
  const { data: authStatus } = useAuthStatus();
  
  return useQuery({
    queryKey: authKeys.user,
    queryFn: () => authService.getCurrentUser(),
    enabled: authStatus?.isAuthenticated ?? false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if it's an auth error
      if (error?.message?.includes('401') || error?.message?.includes('unauthorized')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: async (response) => {
      // Save tokens
      await authService.saveTokens(response.accessToken, response.refreshToken);
      
      // Update auth status immediately
      queryClient.setQueryData(authKeys.status, { isAuthenticated: true });
      
      // Cache user data immediately
      queryClient.setQueryData(authKeys.user, response.user);
      
      // Also refetch to ensure we have the latest data
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: authKeys.user });
      }, 100);
    },
    onError: (error) => {
      console.error('Login failed:', error);
      // Clear any cached data on login failure
      queryClient.removeQueries({ queryKey: authKeys.user });
      queryClient.setQueryData(authKeys.status, { isAuthenticated: false });
    },
  });
};

// Register mutation
export const useRegister = () => {
  return useMutation({
    mutationFn: (userData: RegisterRequest) => authService.register(userData),
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Update auth status
      queryClient.setQueryData(authKeys.status, { isAuthenticated: false });
      
      // Clear all user data
      queryClient.removeQueries({ queryKey: authKeys.user });
      
      // Clear all cached data
      queryClient.clear();
    },
  });
};

// Update profile mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => authService.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Update cached user data
      queryClient.setQueryData(authKeys.user, updatedUser);
    },
  });
};

// Email verification mutation
export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
  });
};

// Resend verification mutation
export const useResendVerification = () => {
  return useMutation({
    mutationFn: (email: string) => authService.resendVerification(email),
  });
};
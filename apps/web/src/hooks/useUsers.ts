// apps/web/src/hooks/useUsers.ts - FIXED VERSION

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, User, ApiResponse, PaginatedResponse } from '../lib/api';
import { useState } from 'react';

interface UserFilters {
  page: number;
  limit: number;
  search: string;
  role: string;
  isActive: string;
  isVerified: string;
  sortBy: string;
  sortOrder: string;
}

export const useUsers = () => {
  const [params, setParams] = useState<UserFilters>({
    page: 1,
    limit: 20,
    search: '',
    role: '',
    isActive: '',
    isVerified: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      console.log('🔍 Fetching users with params:', params);
      const response = await userAPI.getAll(params);
      console.log('📦 Full response:', response);
      
      // ✅ FIX: Handle nested response structure
      let users, meta;
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          // Format 1: { success: true, data: [...], meta: {...} }
          users = response.data;
          meta = response.meta;
        } else if (response.data.data) {
          // Format 2: { success: true, data: { data: [...], meta: {...} } }
          users = response.data.data;
          meta = response.data.meta;
        } else {
          console.error('❌ Unexpected response format:', response);
          throw new Error('Invalid response format from server');
        }
      } else {
        console.error('❌ No data in response:', response);
        throw new Error('No data received from server');
      }
      
      console.log('✅ Extracted users:', users?.length || 0, 'items');
      console.log('✅ Pagination meta:', meta);
      
      return { data: users || [], meta: meta || {} };
    },
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
  });

  // ✅ Toggle user ban status (not delete)
  const toggleStatusMutation = useMutation({
    mutationFn: async (userId: number) => {
      console.log('🔄 Toggling user status:', userId);
      return await userAPI.toggleStatus(userId);
    },
    onSuccess: (data) => {
      console.log('✅ User status toggled:', data);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      console.error('❌ Toggle status error:', error);
    }
  });

  // ✅ Update user role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      console.log('🔄 Updating user role:', { userId, role });
      return await userAPI.updateRole(userId, role);
    },
    onSuccess: (data) => {
      console.log('✅ User role updated:', data);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      console.error('❌ Update role error:', error);
    }
  });

  // ✅ Permanent delete user
  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => {
      console.log('🗑️ Permanently deleting user:', userId);
      return await userAPI.delete(userId);
    },
    onSuccess: (data) => {
      console.log('✅ User permanently deleted:', data);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      console.error('❌ Delete user error:', error);
    }
  });

  return {
    users: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    params,
    setParams,
    refetch,
    
    // Actions
    toggleStatus: toggleStatusMutation.mutateAsync,
    updateRole: updateRoleMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,
    
    // Loading states
    isToggling: toggleStatusMutation.isPending,
    isUpdating: updateRoleMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
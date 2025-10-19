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
      
      // ✅ FIX: Handle different response structures
      // Backend might return: { success: true, data: [...], meta: {...} }
      // OR: { success: true, data: { data: [...], meta: {...} } }
      
      let users, meta;
      
      if (response.data && Array.isArray(response.data)) {
        // Format 1: { success: true, data: [...], meta: {...} }
        users = response.data;
        meta = response.meta;
      } else if (response.data && response.data.data) {
        // Format 2: { success: true, data: { data: [...], meta: {...} } }
        users = response.data.data;
        meta = response.data.meta;
      } else {
        console.error('❌ Unexpected response format:', response);
        throw new Error('Invalid response format from server');
      }
      
      console.log('✅ Extracted users:', users.length, 'items');
      console.log('✅ Pagination meta:', meta);
      
      return { data: users, meta };
    },
    retry: 1,
  });

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

  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => {
      console.log('🗑️ Deleting user:', userId);
      return await userAPI.delete(userId);
    },
    onSuccess: (data) => {
      console.log('✅ User deleted:', data);
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
    toggleStatus: toggleStatusMutation.mutateAsync,
    updateRole: updateRoleMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,
    isToggling: toggleStatusMutation.isPending,
    isUpdating: updateRoleMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
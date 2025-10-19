// apps/web/src/hooks/useUsers.ts - COMPLETE FIXED VERSION
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, User, ApiResponse } from '../lib/api';
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

  const { data, isLoading, error } = useQuery<ApiResponse<User[]>>({
    queryKey: ['users', params],
    queryFn: () => userAPI.getAll(params),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (userId: number) => userAPI.toggleStatus(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) => 
      userAPI.updateRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => userAPI.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    users: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    params,
    setParams,
    toggleStatus: toggleStatusMutation.mutateAsync,
    updateRole: updateRoleMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,
    isToggling: toggleStatusMutation.isPending,
    isUpdating: updateRoleMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
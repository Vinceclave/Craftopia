// apps/web/src/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../lib/api';
import { useState } from 'react';

export const useUsers = () => {
  const [params, setParams] = useState({
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

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', params],
    queryFn: () => userAPI.getAll(params),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: userAPI.toggleStatus,
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
    mutationFn: userAPI.delete,
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

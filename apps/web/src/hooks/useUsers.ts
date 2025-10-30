// ✅ Fully typed and production-ready hook for user listing, moderation, and role management.

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
    sortOrder: 'desc',
  });

  const queryClient = useQueryClient();

  /**
   * 🔍 Fetch paginated users with search, sorting, and filters.
   */
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const response: ApiResponse<PaginatedResponse<User>> = await userAPI.getAll(params);

      // ✅ Extract paginated users and metadata from wrapped response
      const paginated = response?.data ?? { data: [], meta: {} };

      return {
        data: paginated.data,
        meta: paginated.meta,
      };
    },
    retry: 1,
    staleTime: 30_000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
  });

  /**
   * 🚫 Toggle user's active status (ban/unban) without deleting.
   */
  const toggleStatusMutation = useMutation({
    mutationFn: async (userId: number) => await userAPI.toggleStatus(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  /**
   * 🧭 Update user role (e.g., admin, moderator, member).
   */
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) =>
      await userAPI.updateRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  /**
   * 🗑️ Permanently delete a user from the system.
   */
  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => await userAPI.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    // 📦 Data
    users: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    params,
    setParams,
    refetch,

    // ⚙️ Actions
    toggleStatus: toggleStatusMutation.mutateAsync,
    updateRole: updateRoleMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,

    // 🔄 Loading states
    isToggling: toggleStatusMutation.isPending,
    isUpdating: updateRoleMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

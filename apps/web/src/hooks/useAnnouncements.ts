// apps/web/src/hooks/useAnnouncements.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementsAPI, Announcement, ApiResponse, PaginatedResponse } from '../lib/api';
import { useState, useCallback, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { useToast } from './useToast';

interface AnnouncementFilters {
  page: number;
  limit: number;
  includeExpired: boolean;
}

export const useAnnouncements = () => {
  const [params, setParams] = useState<AnnouncementFilters>({
    page: 1,
    limit: 10,
    includeExpired: false,
  });

  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket();
  const { success, info } = useToast();

  // Fetch all announcements
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['announcements', params],
    queryFn: async () => {
      const response: ApiResponse<PaginatedResponse<Announcement>> = 
        await announcementsAPI.getAll(params.page, params.limit, params.includeExpired);
      
      const paginated = response?.data ?? { data: [], meta: {} };
      return {
        data: paginated.data,
        meta: paginated.meta,
      };
    },
    retry: 1,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // Fetch active announcements
  const {
    data: activeData,
    refetch: refetchActive,
  } = useQuery({
    queryKey: ['active-announcements'],
    queryFn: async () => {
      const response: ApiResponse<Announcement[]> = await announcementsAPI.getActive(5);
      return response.data || [];
    },
    staleTime: 60_000,
  });

  // Create announcement
  const createMutation = useMutation({
    mutationFn: async (announcementData: {
      title: string;
      content: string;
      expires_at?: Date;
    }) => {
      const response: ApiResponse<Announcement> = await announcementsAPI.create(announcementData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
      success('Announcement created successfully!');
    },
  });

  // Update announcement
  const updateMutation = useMutation({
    mutationFn: async ({
      announcementId,
      data: updateData,
    }: {
      announcementId: number;
      data: Partial<{
        title: string;
        content: string;
        is_active: boolean;
        expires_at: Date | null;
      }>;
    }) => {
      const response: ApiResponse<Announcement> = 
        await announcementsAPI.update(announcementId, updateData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
      success('Announcement updated successfully!');
    },
  });

  // Delete announcement
  const deleteMutation = useMutation({
    mutationFn: async (announcementId: number) => {
      await announcementsAPI.delete(announcementId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
      success('Announcement deleted successfully!');
    },
  });

  // Toggle status
  const toggleStatusMutation = useMutation({
    mutationFn: async (announcementId: number) => {
      const response: ApiResponse<Announcement> = 
        await announcementsAPI.toggleStatus(announcementId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
      success('Announcement status updated!');
    },
  });

  // WebSocket event handlers
  const handleAnnouncementCreated = useCallback((data: any) => {
    info(data.message || 'New announcement created!');
    queryClient.invalidateQueries({ queryKey: ['announcements'] });
    queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
  }, [queryClient, info]);

  const handleAnnouncementUpdated = useCallback((data: any) => {
    info(data.message || 'Announcement updated!');
    queryClient.invalidateQueries({ queryKey: ['announcements'] });
    queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
  }, [queryClient, info]);

  const handleAnnouncementDeleted = useCallback((data: any) => {
    info(data.message || 'Announcement deleted!');
    queryClient.invalidateQueries({ queryKey: ['announcements'] });
    queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
  }, [queryClient, info]);

  // Subscribe to WebSocket events
  useEffect(() => {
    const unsubscribeCreated = subscribe('announcement:created', handleAnnouncementCreated);
    const unsubscribeUpdated = subscribe('announcement:updated', handleAnnouncementUpdated);
    const unsubscribeDeleted = subscribe('announcement:deleted', handleAnnouncementDeleted);

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
    };
  }, [subscribe, handleAnnouncementCreated, handleAnnouncementUpdated, handleAnnouncementDeleted]);

  // Pagination helpers
  const goToPage = useCallback((page: number) => {
    setParams(prev => ({ ...prev, page }));
  }, []);

  const nextPage = useCallback(() => {
    if (data?.meta?.hasNextPage) {
      setParams(prev => ({ ...prev, page: prev.page + 1 }));
    }
  }, [data?.meta]);

  const prevPage = useCallback(() => {
    if (data?.meta?.hasPrevPage) {
      setParams(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }));
    }
  }, [data?.meta]);

  const setLimit = useCallback((limit: number) => {
    setParams(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  return {
    // Data
    announcements: data?.data || [],
    activeAnnouncements: activeData || [],
    meta: data?.meta,
    isLoading,
    error,
    params,
    
    // Actions
    setParams,
    refetch,
    createAnnouncement: createMutation.mutateAsync,
    updateAnnouncement: updateMutation.mutateAsync,
    deleteAnnouncement: deleteMutation.mutateAsync,
    toggleStatus: toggleStatusMutation.mutateAsync,
    
    // Pagination
    goToPage,
    nextPage,
    prevPage,
    setLimit,
    
    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleStatusMutation.isPending,
  };
};
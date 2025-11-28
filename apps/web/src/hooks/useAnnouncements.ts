// apps/web/src/hooks/useAnnouncements.ts - FIXED TO INCLUDE EXPIRED
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementsAPI } from '../lib/api';
import { useState, useCallback, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { useToast } from './useToast';

interface AnnouncementFilters {
  page: number;
  limit: number;
  includeExpired: boolean;
}

export const useAnnouncements = (initialParams: Partial<AnnouncementFilters> = {}) => {
  const [params, setParams] = useState<AnnouncementFilters>({
    page: 1,
    limit: 20,
    includeExpired: true, // CHANGED: Include expired announcements by default
    ...initialParams,
  });

  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket();
  const { success, info, error: showError } = useToast();

  // Fetch all announcements INCLUDING expired
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['announcements', params],
    queryFn: async () => {
      try {
        console.log('📢 Fetching announcements with params:', params);
        
        const response: any = await announcementsAPI.getAll(
          params.page, 
          params.limit, 
          params.includeExpired // This now includes expired announcements
        );
        
        console.log('📢 Announcements API Response:', response);
        
        const announcementsData = response?.data || [];
        const meta = response?.meta || {
          total: Array.isArray(announcementsData) ? announcementsData.length : 0,
          page: params.page,
          limit: params.limit,
          lastPage: 1,
        };
        
        return {
          data: Array.isArray(announcementsData) ? announcementsData : [],
          meta,
        };
      } catch (err) {
        console.error('❌ Error fetching announcements:', err);
        throw err;
      }
    },
    retry: 2,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // Fetch active announcements (for the preview section)
  const {
    data: activeData,
  } = useQuery({
    queryKey: ['active-announcements'],
    queryFn: async () => {
      try {
        const response: any = await announcementsAPI.getActive(5);
        return response?.data || [];
      } catch (err) {
        console.error('❌ Error fetching active announcements:', err);
        return [];
      }
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
      const response: any = await announcementsAPI.create(announcementData);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
      success('Announcement created successfully!');
    },
    onError: (err: any) => {
      showError(err?.message || 'Failed to create announcement');
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
      const response: any = await announcementsAPI.update(announcementId, updateData);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
      success('Announcement updated successfully!');
    },
    onError: (err: any) => {
      showError(err?.message || 'Failed to update announcement');
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
    onError: (err: any) => {
      showError(err?.message || 'Failed to delete announcement');
    },
  });

  // Toggle status
  const toggleStatusMutation = useMutation({
    mutationFn: async (announcementId: number) => {
      const response: any = await announcementsAPI.toggleStatus(announcementId);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
      success('Announcement status updated!');
    },
    onError: (err: any) => {
      showError(err?.message || 'Failed to toggle announcement status');
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

  const setIncludeExpired = useCallback((includeExpired: boolean) => {
    setParams(prev => ({ ...prev, includeExpired, page: 1 }));
  }, []);

  return {
    // Data
    announcements: data?.data || [],
    activeAnnouncements: activeData || [],
    meta: data?.meta || {
      total: 0,
      page: params.page,
      limit: params.limit,
      lastPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
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
    setIncludeExpired,
    
    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleStatusMutation.isPending,
  };
};
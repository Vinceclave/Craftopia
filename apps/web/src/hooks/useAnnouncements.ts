// apps/web/src/hooks/useAnnouncements.ts - FINAL FIX
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementsAPI } from '../lib/api';
import { useState, useCallback, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { useToast } from '@/components/ui/use-toast';

interface AnnouncementFilters {
  page: number;
  limit: number;
  status: string;
  search: string;
}

export const useAnnouncements = () => {
  const [params, setParams] = useState<AnnouncementFilters>({
    page: 1,
    limit: 20,
    status: 'all',
    search: '',
  });

  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket();
  const { toast } = useToast();

  // Fetch all announcements for stats (no filters)
  // 🔥 FIX: Changed limit from 1000 to 100 (backend validation limit)
  const { data: allAnnouncementsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['announcements-all'],
    queryFn: async () => {
      const response: any = await announcementsAPI.getAll(1, 100, undefined, undefined);
      // response.data is the announcements array
      return response?.data || [];
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  // Fetch filtered announcements
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['announcements', params],
    queryFn: async () => {
      const response: any = await announcementsAPI.getAll(
        params.page,
        params.limit,
        params.status === 'all' ? undefined : params.status,
        params.search
      );
      // response.data is the announcements array
      // response.meta is the pagination metadata
      return {
        data: response?.data || [],
        meta: response?.meta || {},
      };
    },
    retry: 1,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // Fetch active announcements
  const { data: activeData } = useQuery({
    queryKey: ['active-announcements'],
    queryFn: async () => {
      const response: any = await announcementsAPI.getActive(5);
      // response.data is the announcements array
      return response?.data || [];
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
      queryClient.invalidateQueries({ queryKey: ['announcements-all'] });
      queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
      toast({
        title: 'Success',
        description: 'Announcement created successfully!',
      });
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
      queryClient.invalidateQueries({ queryKey: ['announcements-all'] });
      queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
      toast({
        title: 'Success',
        description: 'Announcement updated successfully!',
      });
    },
  });

  // Delete announcement
  const deleteMutation = useMutation({
    mutationFn: async (announcementId: number) => {
      await announcementsAPI.delete(announcementId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements-all'] });
      queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
      toast({
        title: 'Success',
        description: 'Announcement deleted successfully!',
      });
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
      queryClient.invalidateQueries({ queryKey: ['announcements-all'] });
      queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
      toast({
        title: 'Success',
        description: 'Announcement status updated!',
      });
    },
  });

  // WebSocket event handlers
  const handleAnnouncementCreated = useCallback(
    (data: any) => {
      toast({
        title: 'Info',
        description: data.message || 'New announcement created!',
      });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements-all'] });
      queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
    },
    [queryClient, toast]
  );

  const handleAnnouncementUpdated = useCallback(
    (data: any) => {
      toast({
        title: 'Info',
        description: data.message || 'Announcement updated!',
      });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements-all'] });
      queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
    },
    [queryClient, toast]
  );

  const handleAnnouncementDeleted = useCallback(
    (data: any) => {
      toast({
        title: 'Info',
        description: data.message || 'Announcement deleted!',
      });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements-all'] });
      queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
    },
    [queryClient, toast]
  );

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
    setParams((prev) => ({ ...prev, page }));
  }, []);

  const nextPage = useCallback(() => {
    if (data?.meta?.hasNextPage) {
      setParams((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [data?.meta]);

  const prevPage = useCallback(() => {
    if (data?.meta?.hasPrevPage) {
      setParams((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }));
    }
  }, [data?.meta]);

  const setLimit = useCallback((limit: number) => {
    setParams((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const setStatus = useCallback((status: string) => {
    setParams((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  return {
    announcements: data?.data || [],
    allAnnouncements: allAnnouncementsData || [],
    activeAnnouncements: activeData || [],
    meta: data?.meta,
    isLoading,
    error,
    params,

    setParams,
    refetch,
    createAnnouncement: createMutation.mutateAsync,
    updateAnnouncement: updateMutation.mutateAsync,
    deleteAnnouncement: deleteMutation.mutateAsync,
    toggleStatus: toggleStatusMutation.mutateAsync,

    goToPage,
    nextPage,
    prevPage,
    setLimit,
    setStatus,
    setSearch,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleStatusMutation.isPending,
    isStatsLoading,
  };
};
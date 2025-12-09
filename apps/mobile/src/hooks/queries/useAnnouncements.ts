// apps/mobile/src/hooks/queries/useAnnouncements.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '~/services/base.service';
import { API_ENDPOINTS } from '~/config/api';
import { useEffect } from 'react';
import { useWebSocket } from '~/context/WebSocketContext';
import { WebSocketEvent } from '~/config/websocket';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Announcement {
  announcement_id: number;
  title: string;
  content: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  admin?: {
    user_id: number;
    username: string;
  };
}

// Query keys
export const announcementKeys = {
  all: ['announcements'] as const,
  active: () => [...announcementKeys.all, 'active'] as const,
  list: (includeExpired: boolean) => [...announcementKeys.all, 'list', includeExpired] as const,
};

/**
 * Get active announcements
 */
export const useActiveAnnouncements = () => {
  const queryClient = useQueryClient();
  const { on, off, isConnected } = useWebSocket();

  const query = useQuery({
    queryKey: announcementKeys.active(),
    queryFn: async (): Promise<Announcement[]> => {
      try {
        const response: any = await apiService.request(
          `${API_ENDPOINTS.ANNOUNCEMENTS.ACTIVE}?limit=10`,
          { method: 'GET' }
        );

        const announcements = response.data || response || [];
        
        return Array.isArray(announcements) ? announcements : [];
      } catch (error: any) {
        console.error('❌ [useActiveAnnouncements] Error:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Real-time updates via WebSocket
  useEffect(() => {
    if (!isConnected) return;

    const handleAnnouncementCreated = (data: any) => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.active() });
    };

    const handleAnnouncementUpdated = (data: any) => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.active() });
    };

    const handleAnnouncementDeleted = (announcementId: number) => {
      
      // Remove from cache immediately
      queryClient.setQueryData<Announcement[]>(
        announcementKeys.active(),
        (old = []) => old.filter(a => a.announcement_id !== announcementId)
      );
    };

    on(WebSocketEvent.ANNOUNCEMENT_CREATED, handleAnnouncementCreated);
    on(WebSocketEvent.ANNOUNCEMENT_UPDATED, handleAnnouncementUpdated);
    on(WebSocketEvent.ANNOUNCEMENT_DELETED, handleAnnouncementDeleted);

    return () => {
      off(WebSocketEvent.ANNOUNCEMENT_CREATED, handleAnnouncementCreated);
      off(WebSocketEvent.ANNOUNCEMENT_UPDATED, handleAnnouncementUpdated);
      off(WebSocketEvent.ANNOUNCEMENT_DELETED, handleAnnouncementDeleted);
    };
  }, [isConnected, on, off, queryClient]);

  return query;
};

/**
 * Get unread announcement count
 */
export const useUnreadAnnouncementCount = () => {
  const { data: announcements = [] } = useActiveAnnouncements();

  const query = useQuery({
    queryKey: [...announcementKeys.all, 'unreadCount'],
    queryFn: async () => {
      try {
        const readIds = await AsyncStorage.getItem('read_announcements');
        const readSet = new Set(readIds ? JSON.parse(readIds) : []);
        
        const unreadCount = announcements.filter(
          a => !readSet.has(a.announcement_id)
        ).length;
        
        return unreadCount;
      } catch (error) {
        console.error('Failed to get unread count:', error);
        return announcements.length;
      }
    },
    enabled: announcements.length > 0,
    staleTime: 30 * 1000, // 30 seconds
  });

  return query.data || 0;
};

/**
 * Mark announcement as read
 */
export const useMarkAnnouncementRead = () => {
  const queryClient = useQueryClient();

  return async (announcementId: number) => {
    try {
      const readIds = await AsyncStorage.getItem('read_announcements');
      const readSet = new Set(readIds ? JSON.parse(readIds) : []);
      readSet.add(announcementId);
      
      await AsyncStorage.setItem(
        'read_announcements',
        JSON.stringify(Array.from(readSet))
      );
      
      // Invalidate unread count
      queryClient.invalidateQueries({ 
        queryKey: [...announcementKeys.all, 'unreadCount'] 
      });
    } catch (error) {
      console.error('Failed to mark announcement as read:', error);
    }
  };
};

/**
 * Mark all announcements as read
 */
export const useMarkAllAnnouncementsRead = () => {
  const queryClient = useQueryClient();
  const { data: announcements = [] } = useActiveAnnouncements();

  return async () => {
    try {
      const allIds = announcements.map(a => a.announcement_id);
      await AsyncStorage.setItem(
        'read_announcements',
        JSON.stringify(allIds)
      );
      
      queryClient.invalidateQueries({ 
        queryKey: [...announcementKeys.all, 'unreadCount'] 
      });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };
};
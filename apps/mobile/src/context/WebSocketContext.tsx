// apps/mobile/src/context/WebSocketContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { wsManager, WebSocketEvent } from '~/config/websocket';
import { useAuth } from './AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { postKeys } from '~/hooks/queries/usePosts';
import { Alert } from 'react-native';

interface WebSocketContextType {
  isConnected: boolean;
  emit: (event: string, data: any) => void;
  on: (event: WebSocketEvent | string, callback: Function) => void;
  off: (event: WebSocketEvent | string, callback: Function) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  // Connect when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      wsManager.connect()
        .then(() => {
          setIsConnected(true);
          console.log('WebSocket connected for user:', user.id);
        })
        .catch((error) => {
          console.error('WebSocket connection failed:', error);
          setIsConnected(false);
        });

      return () => {
        wsManager.disconnect();
        setIsConnected(false);
      };
    }
  }, [isAuthenticated, user]);

  // Setup event listeners
  useEffect(() => {
    if (!isConnected) return;

    // Post Events
    const handlePostCreated = (data: any) => {
      console.log('📢 New post created:', data);
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      
      // Optionally show notification
      if (data.author !== user?.username) {
        // Show toast notification
      }
    };

    const handlePostDeleted = (data: any) => {
      console.log('🗑️ Post deleted:', data);
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.removeQueries({ queryKey: postKeys.detail(data.postId) });
    };

    const handlePostLiked = (data: any) => {
      console.log('❤️ Post liked:', data);
      // Optionally update cache or show notification
    };

    const handlePostCommented = (data: any) => {
      console.log('💬 New comment:', data);
      queryClient.invalidateQueries({ queryKey: postKeys.comments(data.postId) });
      
      // Show notification to post owner
      Alert.alert(
        'New Comment',
        `${data.username} commented on your post`,
        [{ text: 'OK' }]
      );
    };

    // Challenge Events
    const handleChallengeCreated = (data: any) => {
      console.log('🏆 New challenge:', data);
      // Invalidate challenges list
    };

    const handleChallengeVerified = (data: any) => {
      console.log('✅ Challenge verified:', data);
      Alert.alert(
        '🎉 Challenge Verified!',
        `You earned ${data.points_awarded} points!`,
        [{ text: 'Awesome!' }]
      );
    };

    const handleChallengeRejected = (data: any) => {
      console.log('❌ Challenge rejected:', data);
      Alert.alert(
        'Challenge Rejected',
        data.reason || 'Please try again with better proof.',
        [{ text: 'OK' }]
      );
    };

    // Points Events
    const handlePointsAwarded = (data: any) => {
      console.log('⭐ Points awarded:', data);
      // Update user profile cache
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    };

    const handleLeaderboardUpdated = (data: any) => {
      console.log('📊 Leaderboard updated:', data);
      // Update leaderboard cache
    };

    // Announcement Events
    const handleAnnouncementCreated = (data: any) => {
      console.log('📢 New announcement:', data);
      Alert.alert(
        data.title,
        data.content,
        [{ text: 'Got it' }]
      );
    };

    // Moderation Events
    const handleUserBanned = (data: any) => {
      console.log('⚠️ User banned:', data);
      Alert.alert(
        'Account Suspended',
        data.message,
        [{ text: 'OK', onPress: () => {
          // Force logout
        }}]
      );
    };

    const handleContentModerated = (data: any) => {
      console.log('⚠️ Content moderated:', data);
      Alert.alert(
        'Content Removed',
        `Your ${data.content_type} was removed: ${data.reason}`,
        [{ text: 'OK' }]
      );
    };

    // Notification Events
    const handleNotification = (data: any) => {
      console.log('🔔 Notification:', data);
      // Show in-app notification
    };

    // Register all event listeners
    wsManager.on(WebSocketEvent.POST_CREATED, handlePostCreated);
    wsManager.on(WebSocketEvent.POST_DELETED, handlePostDeleted);
    wsManager.on(WebSocketEvent.POST_LIKED, handlePostLiked);
    wsManager.on(WebSocketEvent.POST_COMMENTED, handlePostCommented);
    wsManager.on(WebSocketEvent.CHALLENGE_CREATED, handleChallengeCreated);
    wsManager.on(WebSocketEvent.CHALLENGE_VERIFIED, handleChallengeVerified);
    wsManager.on(WebSocketEvent.CHALLENGE_REJECTED, handleChallengeRejected);
    wsManager.on(WebSocketEvent.POINTS_AWARDED, handlePointsAwarded);
    wsManager.on(WebSocketEvent.LEADERBOARD_UPDATED, handleLeaderboardUpdated);
    wsManager.on(WebSocketEvent.ANNOUNCEMENT_CREATED, handleAnnouncementCreated);
    wsManager.on(WebSocketEvent.USER_BANNED, handleUserBanned);
    wsManager.on(WebSocketEvent.CONTENT_MODERATED, handleContentModerated);
    wsManager.on(WebSocketEvent.NOTIFICATION, handleNotification);

    // Cleanup
    return () => {
      wsManager.off(WebSocketEvent.POST_CREATED, handlePostCreated);
      wsManager.off(WebSocketEvent.POST_DELETED, handlePostDeleted);
      wsManager.off(WebSocketEvent.POST_LIKED, handlePostLiked);
      wsManager.off(WebSocketEvent.POST_COMMENTED, handlePostCommented);
      wsManager.off(WebSocketEvent.CHALLENGE_CREATED, handleChallengeCreated);
      wsManager.off(WebSocketEvent.CHALLENGE_VERIFIED, handleChallengeVerified);
      wsManager.off(WebSocketEvent.CHALLENGE_REJECTED, handleChallengeRejected);
      wsManager.off(WebSocketEvent.POINTS_AWARDED, handlePointsAwarded);
      wsManager.off(WebSocketEvent.LEADERBOARD_UPDATED, handleLeaderboardUpdated);
      wsManager.off(WebSocketEvent.ANNOUNCEMENT_CREATED, handleAnnouncementCreated);
      wsManager.off(WebSocketEvent.USER_BANNED, handleUserBanned);
      wsManager.off(WebSocketEvent.CONTENT_MODERATED, handleContentModerated);
      wsManager.off(WebSocketEvent.NOTIFICATION, handleNotification);
    };
  }, [isConnected, queryClient, user]);

  const emit = useCallback((event: string, data: any) => {
    wsManager.emit(event, data);
  }, []);

  const on = useCallback((event: WebSocketEvent | string, callback: Function) => {
    wsManager.on(event, callback);
  }, []);

  const off = useCallback((event: WebSocketEvent | string, callback: Function) => {
    wsManager.off(event, callback);
  }, []);

  const value = {
    isConnected,
    emit,
    on,
    off,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};
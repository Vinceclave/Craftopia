// apps/mobile/src/context/WebSocketContext.tsx - FIXED VERSION
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
          console.log('✅ WebSocket connected for user:', user.id);
        })
        .catch((error) => {
          console.error('❌ WebSocket connection failed:', error);
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

    // ========================================
    // POST EVENTS - REAL-TIME UPDATES
    // ========================================
    
    const handlePostCreated = (data: any) => {
      console.log('📢 New post created:', data);
      
      // Force immediate refetch of all post lists
      queryClient.invalidateQueries({ 
        queryKey: postKeys.lists(),
        refetchType: 'active' // Force active queries to refetch immediately
      });
      
      // Optionally show notification if from another user
      if (data.author !== user?.username) {
        // Could show a toast notification here
        console.log(`New post from ${data.author}: ${data.title}`);
      }
    };

    const handlePostDeleted = (data: any) => {
      console.log('🗑️ Post deleted:', data);
      
      // Remove from cache immediately for instant UI update
      queryClient.setQueriesData(
        { queryKey: postKeys.lists() },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          // Handle array structure (regular query)
          if (Array.isArray(oldData)) {
            return oldData.filter((post: any) => post.post_id !== data.postId);
          }
          
          // Handle infinite query structure
          if (oldData.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                posts: page.posts?.filter((post: any) => post.post_id !== data.postId) || [],
              })),
            };
          }
          
          return oldData;
        }
      );
      
      // Remove individual post from cache
      queryClient.removeQueries({ queryKey: postKeys.detail(data.postId) });
    };

    const handlePostLiked = (data: any) => {
      console.log('❤️ Post liked:', data);
      
      // Update like count in all post lists immediately
      queryClient.setQueriesData(
        { queryKey: postKeys.lists() },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          const updatePost = (post: any) =>
            post.post_id === data.postId
              ? { 
                  ...post, 
                  likeCount: data.likeCount,
                  // Only update isLiked if this is the user who liked it
                  ...(data.userId === user?.id ? { isLiked: true } : {})
                }
              : post;
          
          // Handle array structure
          if (Array.isArray(oldData)) {
            return oldData.map(updatePost);
          }
          
          // Handle infinite query structure
          if (oldData.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                posts: page.posts?.map(updatePost) || [],
              })),
            };
          }
          
          return oldData;
        }
      );
      
      // Show notification to post owner
      if (data.userId !== user?.id && user?.id) {
        // Optional: Show toast notification
        console.log(`${data.username} liked your post`);
      }
    };

    const handlePostCommented = (data: any) => {
      console.log('💬 New comment on post:', data);
      
      // Invalidate comments for specific post
      queryClient.invalidateQueries({ 
        queryKey: postKeys.comments(data.postId),
        refetchType: 'active'
      });
      
      // Update comment count in posts list immediately
      queryClient.setQueriesData(
        { queryKey: postKeys.lists() },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          const updatePost = (post: any) =>
            post.post_id === data.postId
              ? { ...post, commentCount: (post.commentCount || 0) + 1 }
              : post;
          
          // Handle array structure
          if (Array.isArray(oldData)) {
            return oldData.map(updatePost);
          }
          
          // Handle infinite query structure
          if (oldData.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                posts: page.posts?.map(updatePost) || [],
              })),
            };
          }
          
          return oldData;
        }
      );
      
      // Show notification to post owner (not to commenter themselves)
      if (data.userId !== user?.id) {
        Alert.alert(
          'New Comment',
          `${data.username} commented: "${data.content}"`,
          [{ text: 'OK' }]
        );
      }
    };

    // ========================================
    // CHALLENGE EVENTS
    // ========================================
    
    const handleChallengeCreated = (data: any) => {
      console.log('🏆 New challenge:', data);
      queryClient.invalidateQueries({ queryKey: ['challenges', 'list'], refetchType: 'active' });
    };

    const handleChallengeVerified = (data: any) => {
      console.log('✅ Challenge verified:', data);
      Alert.alert(
        '🎉 Challenge Verified!',
        `You earned ${data.points_awarded} points!`,
        [{ text: 'Awesome!' }]
      );
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    };

    const handleChallengeRejected = (data: any) => {
      console.log('❌ Challenge rejected:', data);
      Alert.alert(
        'Challenge Rejected',
        data.reason || 'Please try again with better proof.',
        [{ text: 'OK' }]
      );
    };

    // ========================================
    // POINTS & LEADERBOARD EVENTS
    // ========================================
    
    const handlePointsAwarded = (data: any) => {
      console.log('⭐ Points awarded:', data);
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    };

    const handleLeaderboardUpdated = (data: any) => {
      console.log('📊 Leaderboard updated:', data);
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    };

    // ========================================
    // ANNOUNCEMENT EVENTS
    // ========================================
    
    const handleAnnouncementCreated = (data: any) => {
      console.log('📢 New announcement:', data);
      Alert.alert(
        data.title,
        data.content,
        [{ text: 'Got it' }]
      );
    };

    // ========================================
    // MODERATION EVENTS
    // ========================================
    
    const handleUserBanned = (data: any) => {
      console.log('⚠️ User banned:', data);
      Alert.alert(
        'Account Suspended',
        data.message,
        [{ 
          text: 'OK', 
          onPress: () => {
            // Force logout - implement your logout logic here
          }
        }]
      );
    };

    const handleContentModerated = (data: any) => {
      console.log('⚠️ Content moderated:', data);
      Alert.alert(
        'Content Removed',
        `Your ${data.content_type} was removed: ${data.reason}`,
        [{ text: 'OK' }]
      );
      
      // Refresh relevant queries
      if (data.content_type === 'post') {
        queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      }
    };

    // ========================================
    // NOTIFICATION EVENTS
    // ========================================
    
    const handleNotification = (data: any) => {
      console.log('🔔 Notification:', data);
      // Show in-app notification or toast
    };

    // ========================================
    // REGISTER ALL EVENT LISTENERS
    // ========================================
    
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

    // ========================================
    // CLEANUP ON UNMOUNT
    // ========================================
    
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
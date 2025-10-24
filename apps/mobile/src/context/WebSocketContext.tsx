// apps/mobile/src/context/WebSocketContext.tsx - WITH CHALLENGE & WASTE REAL-TIME UPDATES
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { wsManager, WebSocketEvent } from '~/config/websocket';
import { useAuth } from './AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { postKeys } from '~/hooks/queries/usePosts';
import { challengeKeys } from '~/hooks/queries/useChallenges';
import { userChallengeKeys } from '~/hooks/queries/useUserChallenges';
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
  const listenersRegistered = useRef(false);

  // Connect when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔌 Initializing WebSocket connection...');
      
      wsManager.connect()
        .then(() => {
          setIsConnected(true);
          console.log('✅ WebSocket connected successfully for user:', user.id);
        })
        .catch((error) => {
          console.error('❌ WebSocket connection failed:', error);
          setIsConnected(false);
        });

      return () => {
        console.log('🔌 Disconnecting WebSocket...');
        wsManager.disconnect();
        setIsConnected(false);
        listenersRegistered.current = false;
      };
    }
  }, [isAuthenticated, user]);

  // Setup event listeners
  useEffect(() => {
    if (!isConnected || !user || listenersRegistered.current) return;

    console.log('📡 Setting up WebSocket event listeners...');
    listenersRegistered.current = true;

    // ========================================
    // POST EVENTS - BROADCAST (ALL CLIENTS)
    // ========================================
    const handlePostCreated = (data: any) => {
      console.log('📢 [WS BROADCAST] Post created:', {
        post_id: data.post_id,
        title: data.title,
        author: data.author,
        currentUser: user.username
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['posts'],
        refetchType: 'all'
      });
      
      console.log('✅ Post created - all caches invalidated');
    };

    const handlePostLiked = (data: any) => {
      console.log('❤️ [WS BROADCAST] Post liked:', {
        postId: data.postId,
        username: data.username,
        likeCount: data.likeCount,
        isLiked: data.isLiked
      });
      
      queryClient.setQueriesData(
        { queryKey: ['posts'] },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          const updatePost = (post: any) => {
            if (post.post_id !== data.postId) return post;
            
            return {
              ...post,
              likeCount: data.likeCount,
              isLiked: data.userId === user?.id ? data.isLiked : post.isLiked
            };
          };
          
          if (Array.isArray(oldData)) {
            return oldData.map(updatePost);
          }
          
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
      
      queryClient.setQueryData(
        postKeys.detail(data.postId),
        (oldPost: any) => {
          if (!oldPost) return oldPost;
          return {
            ...oldPost,
            likeCount: data.likeCount,
            isLiked: data.userId === user?.id ? data.isLiked : oldPost.isLiked
          };
        }
      );
      
      queryClient.invalidateQueries({ 
        queryKey: ['posts'],
        refetchType: 'none'
      });
    };

    const handlePostCommented = (data: any) => {
      console.log('💬 [WS BROADCAST] Post commented:', {
        postId: data.postId,
        commentId: data.commentId,
        username: data.username
      });
      
      queryClient.setQueriesData(
        { queryKey: ['posts'] },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          const updatePost = (post: any) => {
            if (post.post_id !== data.postId) return post;
            
            const newCommentCount = data.commentCount ?? (post.commentCount + 1);
            
            return {
              ...post,
              commentCount: newCommentCount
            };
          };
          
          if (Array.isArray(oldData)) {
            return oldData.map(updatePost);
          }
          
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
      
      queryClient.setQueryData(
        postKeys.detail(data.postId),
        (oldPost: any) => {
          if (!oldPost) return oldPost;
          return {
            ...oldPost,
            commentCount: data.commentCount ?? (oldPost.commentCount + 1)
          };
        }
      );
      
      queryClient.invalidateQueries({ 
        queryKey: postKeys.comments(data.postId),
        refetchType: 'active'
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['posts'],
        refetchType: 'none'
      });
    };

    const handlePostDeleted = (data: any) => {
      console.log('🗑️ [WS BROADCAST] Post deleted:', {
        postId: data.postId
      });
      
      queryClient.setQueriesData(
        { queryKey: ['posts'] },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          if (Array.isArray(oldData)) {
            const filtered = oldData.filter((post: any) => post.post_id !== data.postId);
            console.log(`🗑️ Removed post from array (${oldData.length} -> ${filtered.length})`);
            return filtered;
          }
          
          if (oldData.pages) {
            const updated = {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                posts: page.posts?.filter((post: any) => post.post_id !== data.postId) || [],
              })),
            };
            console.log('🗑️ Removed post from infinite query pages');
            return updated;
          }
          
          return oldData;
        }
      );
      
      queryClient.removeQueries({ queryKey: postKeys.detail(data.postId) });
      
      queryClient.invalidateQueries({ 
        queryKey: ['posts'], 
        refetchType: 'all' 
      });
      
      console.log('✅ Post deleted and removed from all devices');
    };

    const handlePostUpdated = (data: any) => {
      console.log('📝 [WS BROADCAST] Post updated:', {
        post_id: data.post_id,
        title: data.title
      });
      
      queryClient.setQueryData(
        postKeys.detail(data.post_id),
        (oldPost: any) => {
          if (!oldPost) return oldPost;
          return { ...oldPost, ...data, updated_at: new Date().toISOString() };
        }
      );
      
      queryClient.setQueriesData(
        { queryKey: ['posts'] },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          const updatePost = (post: any) =>
            post.post_id === data.post_id
              ? { ...post, ...data, updated_at: new Date().toISOString() }
              : post;
          
          if (Array.isArray(oldData)) {
            return oldData.map(updatePost);
          }
          
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
      
      console.log('✅ Post updated across all devices');
    };

    // ========================================
    // CHALLENGE EVENTS - REAL-TIME UPDATES
    // ========================================
    const handleChallengeCreated = (data: any) => {
      console.log('🎯 [WS BROADCAST] Challenge created:', {
        challenge_id: data.challenge_id,
        title: data.title,
        waste_kg: data.waste_kg
      });
      
      // Invalidate all challenge queries
      queryClient.invalidateQueries({ 
        queryKey: challengeKeys.all,
        refetchType: 'all'
      });
      
      // Show notification
      Alert.alert(
        '🎯 New Challenge!',
        `${data.title} - Save ${data.waste_kg}kg of waste!`,
        [{ text: 'OK' }]
      );
    };

    const handleChallengeJoined = (data: any) => {
      console.log('✅ [WS USER] Challenge joined:', {
        challengeId: data.challenge?.challenge_id,
        userChallengeId: data.userChallengeId
      });
      
      if (data.userId === user.id) {
        // Invalidate user's challenges
        queryClient.invalidateQueries({ 
          queryKey: userChallengeKeys.lists()
        });
        
        // Update progress for this challenge
        queryClient.invalidateQueries({
          queryKey: userChallengeKeys.progress(data.challenge?.challenge_id, user.id)
        });
      }
    };

    const handleChallengeVerified = (data: any) => {
      console.log('🎉 [WS USER] Challenge verified:', {
        userChallengeId: data.userChallengeId,
        points_awarded: data.points_awarded,
        waste_kg_saved: data.waste_kg_saved // NEW
      });
      
      if (data.userId === user.id) {
        // Invalidate user challenges
        queryClient.invalidateQueries({ 
          queryKey: userChallengeKeys.lists()
        });
        
        // Invalidate waste stats - NEW
        queryClient.invalidateQueries({
          queryKey: userChallengeKeys.wasteStats(user.id)
        });
        
        // Show success notification
        Alert.alert(
          '🎉 Challenge Completed!',
          `You earned ${data.points_awarded} points and saved ${data.waste_kg_saved}kg of waste!`,
          [{ text: 'Awesome!' }]
        );
      }
    };

    const handlePointsAwarded = (data: any) => {
      console.log('⭐ [WS USER] Points awarded:', {
        amount: data.amount,
        waste_kg_saved: data.waste_kg_saved, // NEW
        reason: data.reason
      });
      
      if (data.userId === user.id) {
        // Invalidate user stats
        queryClient.invalidateQueries({ 
          queryKey: ['userStats', user.id]
        });
        
        // Invalidate waste stats - NEW
        queryClient.invalidateQueries({
          queryKey: userChallengeKeys.wasteStats(user.id)
        });
      }
    };

    const handleLeaderboardUpdated = (data: any) => {
      console.log('🏆 [WS BROADCAST] Leaderboard updated:', {
        challengeId: data.challengeId
      });
      
      // Invalidate leaderboard queries
      queryClient.invalidateQueries({ 
        queryKey: ['leaderboard']
      });
    };

    // ========================================
    // CONNECTION EVENTS
    // ========================================
    const handleConnected = (data: any) => {
      console.log('✅ [WS] Connected to server:', data.userId);
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log('❌ [WS] Disconnected from server');
      setIsConnected(false);
    };

    const handleReconnect = () => {
      console.log('🔄 [WS] Reconnecting...');
      // Refetch all data on reconnect
      queryClient.invalidateQueries({ 
        queryKey: ['posts'],
        refetchType: 'all'
      });
      queryClient.invalidateQueries({ 
        queryKey: challengeKeys.all,
        refetchType: 'all'
      });
      queryClient.invalidateQueries({ 
        queryKey: userChallengeKeys.all,
        refetchType: 'all'
      });
    };

    // ========================================
    // REGISTER ALL EVENT LISTENERS
    // ========================================
    console.log('📡 Registering WebSocket event handlers...');
    
    // Post events
    wsManager.on('post:created', handlePostCreated);
    wsManager.on('post:liked', handlePostLiked);
    wsManager.on('post:commented', handlePostCommented);
    wsManager.on('post:deleted', handlePostDeleted);
    wsManager.on('post:updated', handlePostUpdated);
    
    // Challenge events - NEW
    wsManager.on('challenge:created', handleChallengeCreated);
    wsManager.on('challenge:joined', handleChallengeJoined);
    wsManager.on('challenge:verified', handleChallengeVerified);
    wsManager.on('points:awarded', handlePointsAwarded);
    wsManager.on('leaderboard:updated', handleLeaderboardUpdated);
    
    // Connection events
    wsManager.on('connected', handleConnected);
    wsManager.on('disconnect', handleDisconnect);
    wsManager.on('reconnect', handleReconnect);

    console.log('✅ All WebSocket event handlers registered');

    // ========================================
    // CLEANUP ON UNMOUNT
    // ========================================
    return () => {
      console.log('🧹 Cleaning up WebSocket event listeners...');
      listenersRegistered.current = false;
      
      // Post events
      wsManager.off('post:created', handlePostCreated);
      wsManager.off('post:liked', handlePostLiked);
      wsManager.off('post:commented', handlePostCommented);
      wsManager.off('post:deleted', handlePostDeleted);
      wsManager.off('post:updated', handlePostUpdated);
      
      // Challenge events
      wsManager.off('challenge:created', handleChallengeCreated);
      wsManager.off('challenge:joined', handleChallengeJoined);
      wsManager.off('challenge:verified', handleChallengeVerified);
      wsManager.off('points:awarded', handlePointsAwarded);
      wsManager.off('leaderboard:updated', handleLeaderboardUpdated);
      
      // Connection events
      wsManager.off('connected', handleConnected);
      wsManager.off('disconnect', handleDisconnect);
      wsManager.off('reconnect', handleReconnect);
      
      console.log('✅ WebSocket cleanup complete');
    };
  }, [isConnected, queryClient, user]);

  const emit = useCallback((event: string, data: any) => {
    if (!isConnected) {
      console.warn('⚠️ Cannot emit event, WebSocket not connected:', event);
      return;
    }
    console.log('📤 Emitting event:', event, data);
    wsManager.emit(event, data);
  }, [isConnected]);

  const on = useCallback((event: WebSocketEvent | string, callback: Function) => {
    console.log('👂 Registering listener for:', event);
    wsManager.on(event, callback);
  }, []);

  const off = useCallback((event: WebSocketEvent | string, callback: Function) => {
    console.log('👂 Removing listener for:', event);
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
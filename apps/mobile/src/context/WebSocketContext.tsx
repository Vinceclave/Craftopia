// apps/mobile/src/context/WebSocketContext.tsx - FIXED VERSION
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { wsManager, WebSocketEvent } from '~/config/websocket';
import { useAuth } from './AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { postKeys } from '~/hooks/queries/usePosts';
import { challengeKeys } from '~/hooks/queries/useChallenges';
import { userChallengeKeys } from '~/hooks/queries/useUserChallenges';
import { AppState, AppStateStatus } from 'react-native';
import { ModalService } from './modalContext';

interface WebSocketContextType {
  isConnected: boolean;
  emit: (event: string, data: any) => void;
  on: (event: WebSocketEvent | string, callback: Function) => void;
  off: (event: WebSocketEvent | string, callback: Function) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// Constants
const RECONNECT_DELAY = 2000;
const INITIAL_RECONNECT_DELAY = 3000;
const BACKGROUND_RECONNECT_DELAY = 500;

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const listenersRegistered = useRef(false);
  const appState = useRef(AppState.currentState);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionAttemptRef = useRef<number>(0);

  // Cleanup timeouts to prevent memory leaks
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Monitor connection status
  useEffect(() => {
    const handleConnectionChange = (status: boolean) => {
      setIsConnected(status);

      if (status) {
        connectionAttemptRef.current = 0;
      } else if (isAuthenticated && user && appState.current === 'active') {
        clearReconnectTimeout();

        const delay = Math.min(RECONNECT_DELAY * Math.pow(1.5, connectionAttemptRef.current), 30000);
        connectionAttemptRef.current++;

        reconnectTimeoutRef.current = setTimeout(() => {
          wsManager.connect().catch(() => {
            // Error handled by wsManager
          });
        }, delay);
      }
    };

    wsManager.onConnectionStatusChange(handleConnectionChange);

    return () => {
      wsManager.offConnectionStatusChange(handleConnectionChange);
      clearReconnectTimeout();
    };
  }, [isAuthenticated, user, clearReconnectTimeout]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        isAuthenticated &&
        user
      ) {
        setTimeout(() => {
          if (!wsManager.isSocketConnected()) {
            clearReconnectTimeout();
            reconnectTimeoutRef.current = setTimeout(() => {
              wsManager.connect().catch(() => {
                // Error handled by wsManager
              });
            }, BACKGROUND_RECONNECT_DELAY);
          } else {
            wsManager.ping();
          }
        }, BACKGROUND_RECONNECT_DELAY);
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, user, clearReconnectTimeout]);

  // Connect/disconnect based on authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      connectionAttemptRef.current = 0;

      wsManager.connect()
        .then(() => {
          setIsConnected(true);
        })
        .catch(() => {
          setIsConnected(false);

          clearReconnectTimeout();
          reconnectTimeoutRef.current = setTimeout(() => {
            wsManager.connect().catch(() => {
              // Error handled by wsManager
            });
          }, INITIAL_RECONNECT_DELAY);
        });

      return () => {
        clearReconnectTimeout();
      };
    } else if (!isAuthenticated) {
      clearReconnectTimeout();
      connectionAttemptRef.current = 0;
      wsManager.disconnect();
      setIsConnected(false);
      listenersRegistered.current = false;
    }
  }, [isAuthenticated, user, clearReconnectTimeout]);

  // Setup event listeners
  useEffect(() => {
    if (!isConnected || !user || listenersRegistered.current) return;

    listenersRegistered.current = true;

    // Post event handlers
    const handlePostCreated = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['posts'], refetchType: 'all' });
    };

    const handlePostLiked = (data: any) => {
      // ✅ FIX: Check data.userId instead of data.user_id
      const likerUserId = data.userId || data.user_id;

      const updatePost = (post: any) => {
        if (post.post_id !== data.postId) return post;
        return {
          ...post,
          likeCount: data.likeCount,
          // ✅ Only update isLiked if this is the current user's action
          isLiked: likerUserId === user.id ? data.isLiked : post.isLiked
        };
      };

      // Update posts list
      queryClient.setQueriesData(
        { queryKey: ['posts'] },
        (oldData: any) => {
          if (!oldData) return oldData;

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

      // Update individual post
      queryClient.setQueryData(
        postKeys.detail(data.postId),
        (oldPost: any) => {
          if (!oldPost) return oldPost;
          return {
            ...oldPost,
            likeCount: data.likeCount,
            isLiked: likerUserId === user.id ? data.isLiked : oldPost.isLiked
          };
        }
      );
    };

    const handlePostCommented = (data: any) => {
      const updatePost = (post: any) => {
        if (post.post_id !== data.postId) return post;
        const newCommentCount = data.commentCount ?? (post.commentCount + 1);
        return { ...post, commentCount: newCommentCount };
      };

      // Update posts list
      queryClient.setQueriesData(
        { queryKey: ['posts'] },
        (oldData: any) => {
          if (!oldData) return oldData;

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

      // Update individual post
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

      // Invalidate comments
      queryClient.invalidateQueries({
        queryKey: postKeys.comments(data.postId),
        refetchType: 'active'
      });
    };

    const handlePostDeleted = (data: any) => {
      // Update posts list
      queryClient.setQueriesData(
        { queryKey: ['posts'] },
        (oldData: any) => {
          if (!oldData) return oldData;

          if (Array.isArray(oldData)) {
            return oldData.filter((post: any) => post.post_id !== data.postId);
          }

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

      // Remove individual post
      queryClient.removeQueries({ queryKey: postKeys.detail(data.postId) });

      // Invalidate posts
      queryClient.invalidateQueries({ queryKey: ['posts'], refetchType: 'all' });
    };

    const handlePostUpdated = (data: any) => {
      const updatePost = (post: any) =>
        post.post_id === data.post_id
          ? { ...post, ...data, updated_at: new Date().toISOString() }
          : post;

      // Update individual post
      queryClient.setQueryData(
        postKeys.detail(data.post_id),
        (oldPost: any) => {
          if (!oldPost) return oldPost;
          return { ...oldPost, ...data, updated_at: new Date().toISOString() };
        }
      );

      // Update posts list
      queryClient.setQueriesData(
        { queryKey: ['posts'] },
        (oldData: any) => {
          if (!oldData) return oldData;

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
    };

    // Challenge event handlers
    const handleChallengeCreated = (data: any) => {
      queryClient.invalidateQueries({ queryKey: challengeKeys.all, refetchType: 'all' });

      ModalService.show({
        title: 'New Challenge!',
        message: `${data.title} - Save ${data.waste_kg}kg of waste!`,
        type: 'info'
      });
    };

    const handleChallengeJoined = (data: any) => {
      // ✅ No need to check userId - this event is only sent to the user who joined
      queryClient.invalidateQueries({ queryKey: userChallengeKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userChallengeKeys.progress(data.challenge?.challenge_id, user.id)
      });
    };

    const handleChallengeVerified = (data: any) => {
      // ✅ This event is sent directly to the user, so no need to check userId
      queryClient.invalidateQueries({ queryKey: userChallengeKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userChallengeKeys.wasteStats(user.id)
      });

      ModalService.show({
        title: 'Challenge Completed!',
        message: `You earned ${data.points_awarded} points and saved ${data.waste_kg_saved}kg of waste!`,
        type: 'success',
        confirmText: 'Awesome!'
      });
    };

    const handlePointsAwarded = (data: any) => {
      // ✅ This event is sent directly to the user
      queryClient.invalidateQueries({ queryKey: ['userStats', user.id] });
      queryClient.invalidateQueries({
        queryKey: userChallengeKeys.wasteStats(user.id)
      });
    };

    const handleLeaderboardUpdated = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    };

    // Connection event handlers
    const handleConnected = () => {
      setIsConnected(true);
      connectionAttemptRef.current = 0;
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleReconnect = () => {
      queryClient.invalidateQueries({ queryKey: ['posts'], refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: challengeKeys.all, refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: userChallengeKeys.all, refetchType: 'active' });
    };

    // Register event listeners
    const registerListener = (event: string, handler: Function) => {
      wsManager.on(event, handler);
    };

    // Post events
    registerListener('post:created', handlePostCreated);
    registerListener('post:liked', handlePostLiked);
    registerListener('post:commented', handlePostCommented);
    registerListener('post:deleted', handlePostDeleted);
    registerListener('post:updated', handlePostUpdated);

    // Challenge events
    registerListener('challenge:created', handleChallengeCreated);
    registerListener('challenge:joined', handleChallengeJoined);
    registerListener('challenge:verified', handleChallengeVerified);
    registerListener('points:awarded', handlePointsAwarded);
    registerListener('leaderboard:updated', handleLeaderboardUpdated);

    // Connection events
    registerListener('connected', handleConnected);
    registerListener('disconnect', handleDisconnect);
    registerListener('reconnect', handleReconnect);

    // Cleanup
    return () => {
      listenersRegistered.current = false;

      const unregisterListener = (event: string, handler: Function) => {
        wsManager.off(event, handler);
      };

      // Post events
      unregisterListener('post:created', handlePostCreated);
      unregisterListener('post:liked', handlePostLiked);
      unregisterListener('post:commented', handlePostCommented);
      unregisterListener('post:deleted', handlePostDeleted);
      unregisterListener('post:updated', handlePostUpdated);

      // Challenge events
      unregisterListener('challenge:created', handleChallengeCreated);
      unregisterListener('challenge:joined', handleChallengeJoined);
      unregisterListener('challenge:verified', handleChallengeVerified);
      unregisterListener('points:awarded', handlePointsAwarded);
      unregisterListener('leaderboard:updated', handleLeaderboardUpdated);

      // Connection events
      unregisterListener('connected', handleConnected);
      unregisterListener('disconnect', handleDisconnect);
      unregisterListener('reconnect', handleReconnect);
    };
  }, [isConnected, user, queryClient]);

  const emit = useCallback((event: string, data: any) => {
    if (!isConnected) {
      return;
    }
    wsManager.emit(event, data);
  }, [isConnected]);

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
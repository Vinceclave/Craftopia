// apps/mobile/src/context/WebSocketContext.tsx - CRITICAL FIX FOR BROADCAST
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
    // POST CREATED - BROADCAST EVENT (ALL CLIENTS)
    // ========================================
    const handlePostCreated = (data: any) => {
      console.log('📢 [WS BROADCAST] Post created:', {
        post_id: data.post_id,
        title: data.title,
        author: data.author,
        currentUser: user.username
      });
      
      // Invalidate ALL post queries on ALL devices
      queryClient.invalidateQueries({ 
        queryKey: ['posts'],
        refetchType: 'all'
      });
      
      console.log('✅ Post created - all caches invalidated');
    };

    // ========================================
    // POST LIKED - BROADCAST EVENT (ALL CLIENTS)
    // ========================================
    const handlePostLiked = (data: any) => {
      console.log('❤️ [WS BROADCAST] Post liked:', {
        postId: data.postId,
        username: data.username,
        likeCount: data.likeCount,
        userId: data.userId,
        isLiked: data.isLiked,
        currentUserId: user?.id,
        isCurrentUser: data.userId === user?.id
      });
      
      // Update like count in ALL post lists on ALL devices
      queryClient.setQueriesData(
        { queryKey: ['posts'] },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          const updatePost = (post: any) => {
            if (post.post_id !== data.postId) return post;
            
            console.log(`❤️ Updating post ${data.postId}: count ${post.likeCount} -> ${data.likeCount}, isLiked: ${post.isLiked} -> ${data.userId === user?.id ? data.isLiked : post.isLiked}`);
            
            return {
              ...post,
              likeCount: data.likeCount,
              // Only update isLiked for the user who performed the action
              isLiked: data.userId === user?.id ? data.isLiked : post.isLiked
            };
          };
          
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
      
      // Update individual post cache
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
      
      // Show notification if it's marked as a notification (post owner)
      if (data.notification && data.userId !== user?.id) {
        console.log(`💝 ${data.username} liked your post!`);
      }
      
      console.log('✅ Like count updated across all devices');
    };

    // ========================================
    // POST COMMENTED - BROADCAST EVENT (ALL CLIENTS)
    // ========================================
    const handlePostCommented = (data: any) => {
      console.log('💬 [WS BROADCAST] Post commented:', {
        postId: data.postId,
        commentId: data.commentId,
        username: data.username,
        userId: data.userId,
        commentCount: data.commentCount,
        currentUserId: user?.id
      });
      
      // Invalidate comments for specific post
      queryClient.invalidateQueries({ 
        queryKey: postKeys.comments(data.postId),
        refetchType: 'active'
      });
      
      // Update comment count in ALL post lists on ALL devices
      queryClient.setQueriesData(
        { queryKey: ['posts'] },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          const updatePost = (post: any) => {
            if (post.post_id !== data.postId) return post;
            
            const newCommentCount = data.commentCount || (post.commentCount + 1);
            console.log(`💬 Updating post ${data.postId} comment count: ${post.commentCount} -> ${newCommentCount}`);
            
            return {
              ...post,
              commentCount: newCommentCount
            };
          };
          
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
      
      // Update individual post cache
      queryClient.setQueryData(
        postKeys.detail(data.postId),
        (oldPost: any) => {
          if (!oldPost) return oldPost;
          return {
            ...oldPost,
            commentCount: data.commentCount || (oldPost.commentCount + 1)
          };
        }
      );
      
      // Show notification if it's marked as a notification (post owner)
      if (data.notification && data.userId !== user?.id) {
        console.log(`💬 ${data.username} commented: "${data.content}"`);
      }
      
      console.log('✅ Comment count updated across all devices');
    };

    // ========================================
    // POST DELETED - BROADCAST EVENT (ALL CLIENTS)
    // ========================================
    const handlePostDeleted = (data: any) => {
      console.log('🗑️ [WS BROADCAST] Post deleted:', {
        postId: data.postId
      });
      
      // Remove from ALL cached queries on ALL devices
      queryClient.setQueriesData(
        { queryKey: ['posts'] },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          // Handle array structure
          if (Array.isArray(oldData)) {
            const filtered = oldData.filter((post: any) => post.post_id !== data.postId);
            console.log(`🗑️ Removed post from array (${oldData.length} -> ${filtered.length})`);
            return filtered;
          }
          
          // Handle infinite query structure
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
      
      // Remove individual post from cache
      queryClient.removeQueries({ queryKey: postKeys.detail(data.postId) });
      
      // Force refetch
      queryClient.invalidateQueries({ 
        queryKey: ['posts'], 
        refetchType: 'all' 
      });
      
      console.log('✅ Post deleted and removed from all devices');
    };

    // ========================================
    // POST UPDATED - BROADCAST EVENT (ALL CLIENTS)
    // ========================================
    const handlePostUpdated = (data: any) => {
      console.log('📝 [WS BROADCAST] Post updated:', {
        post_id: data.post_id,
        title: data.title
      });
      
      // Update specific post in cache
      queryClient.setQueryData(
        postKeys.detail(data.post_id),
        (oldPost: any) => {
          if (!oldPost) return oldPost;
          return { ...oldPost, ...data, updated_at: new Date().toISOString() };
        }
      );
      
      // Update in all lists
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
    };

    // ========================================
    // REGISTER ALL EVENT LISTENERS
    // ========================================
    console.log('📡 Registering WebSocket event handlers...');
    
    // Post events - ALL BROADCAST
    wsManager.on('post:created', handlePostCreated);
    wsManager.on('post:liked', handlePostLiked);
    wsManager.on('post:commented', handlePostCommented);
    wsManager.on('post:deleted', handlePostDeleted);
    wsManager.on('post:updated', handlePostUpdated);
    
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
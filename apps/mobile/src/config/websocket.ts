// apps/mobile/src/config/websocket.ts
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export enum WebSocketEvent {
  // Challenge Events
  CHALLENGE_CREATED = 'challenge:created',
  CHALLENGE_UPDATED = 'challenge:updated',
  CHALLENGE_DELETED = 'challenge:deleted',
  CHALLENGE_JOINED = 'challenge:joined',
  CHALLENGE_COMPLETED = 'challenge:completed',
  CHALLENGE_VERIFIED = 'challenge:verified',
  CHALLENGE_REJECTED = 'challenge:rejected',
  
  // Points Events
  POINTS_AWARDED = 'points:awarded',
  POINTS_UPDATED = 'points:updated',
  LEADERBOARD_UPDATED = 'leaderboard:updated',
  
  // Post Events
  POST_CREATED = 'post:created',
  POST_UPDATED = 'post:updated',
  POST_DELETED = 'post:deleted',
  POST_LIKED = 'post:liked',
  POST_COMMENTED = 'post:commented',
  
  // Comment Events
  COMMENT_CREATED = 'comment:created',
  COMMENT_DELETED = 'comment:deleted',
  
  // Report Events
  REPORT_CREATED = 'report:created',
  REPORT_UPDATED = 'report:updated',
  REPORT_RESOLVED = 'report:resolved',
  
  // Announcement Events
  ANNOUNCEMENT_CREATED = 'announcement:created',
  ANNOUNCEMENT_UPDATED = 'announcement:updated',
  ANNOUNCEMENT_DELETED = 'announcement:deleted',
  
  // Moderation Events
  CONTENT_MODERATED = 'content:moderated',
  USER_BANNED = 'user:banned',
  USER_UNBANNED = 'user:unbanned',
  USER_ROLE_CHANGED = 'user:role_changed',
  USER_DELETED = 'user:deleted',
  
  // Notification Events
  NOTIFICATION = 'notification',
  
  // System Events
  SYSTEM_MAINTENANCE = 'system:maintenance',
  SYSTEM_UPDATE = 'system:update',
}

export interface WebSocketConfig {
  url: string;
  options: {
    transports: string[];
    reconnection: boolean;
    reconnectionAttempts: number;
    reconnectionDelay: number;
    timeout: number;
  };
}

export const getWebSocketConfig = async (): Promise<WebSocketConfig> => {
  const token = await AsyncStorage.getItem('accessToken');
  
  return {
    url: API_BASE_URL,
    options: {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      auth: {
        token: token || '',
      },
    },
  };
};

export class WebSocketManager {
  private static instance: WebSocketManager;
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private isConnected = false;

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      const config = await getWebSocketConfig();
      
      this.socket = io(config.url, config.options);

      this.socket.on('connect', () => {
        console.log('✅ WebSocket connected:', this.socket?.id);
        this.isConnected = true;
      });

      this.socket.on('connected', (data) => {
        console.log('✅ Server confirmed connection:', data);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ WebSocket disconnected:', reason);
        this.isConnected = false;
      });

      this.socket.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error.message);
      });

      // Setup ping/pong
      this.socket.on('pong', (data) => {
        console.log('🏓 Pong received:', data);
      });

      // Listen to all registered events
      this.setupEventListeners();

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      throw error;
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('WebSocket disconnected');
    }
  }

  on(event: WebSocketEvent | string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // If already connected, setup listener immediately
    if (this.socket) {
      this.socket.on(event, (data) => callback(data));
    }
  }

  off(event: WebSocketEvent | string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
        this.socket?.off(event);
      }
    }
  }

  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Cannot emit, socket not connected');
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket?.on(event, (data) => callback(data));
      });
    });
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  ping(): void {
    if (this.socket?.connected) {
      this.socket.emit('ping');
    }
  }
}

export const wsManager = WebSocketManager.getInstance();
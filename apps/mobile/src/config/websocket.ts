// apps/mobile/src/config/websocket.ts - ENHANCED VERSION
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
    reconnectionDelayMax: number;
    timeout: number;
    autoConnect: boolean;
    auth: {
      token: string;
    };
  };
}

export const getWebSocketConfig = async (): Promise<WebSocketConfig> => {
  const token = await AsyncStorage.getItem('access_token');

  return {
    url: API_BASE_URL!,
    options: {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      autoConnect: false,
      auth: {
        token: token ?? '',
      },
    },
  };
};

export class WebSocketManager {
  private static instance: WebSocketManager;
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private connectionStatusCallbacks: Set<(status: boolean) => void> = new Set();

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log('✅ WebSocket already connected');
      return;
    }

    try {
      console.log('🔌 Connecting to WebSocket server...');
      const config = await getWebSocketConfig();

      this.socket = io(config.url, config.options);

      this.setupSocketListeners();
      this.socket.connect();

    } catch (error) {
      console.error('❌ Failed to connect WebSocket:', error);
      throw error;
    }
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    // Connection established
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.notifyConnectionStatus(true);
      
      // Re-register all listeners
      this.reregisterListeners();
    });

    // Connection message from server
    this.socket.on('connected', (data) => {
      console.log('📡 Server connection confirmed:', data);
    });

    // Disconnection
    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.isConnected = false;
      this.notifyConnectionStatus(false);

      if (reason === 'io server disconnect') {
        // Server disconnected us, reconnect manually
        console.log('🔄 Server disconnected us, attempting reconnect...');
        setTimeout(() => this.socket?.connect(), 1000);
      }
    });

    // Connection error
    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      this.reconnectAttempts++;

      if (error.message.includes('Authentication')) {
        console.warn('⚠️ Token invalid or expired');
        this.handleAuthError();
      } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
        this.disconnect();
      }
    });

    // Reconnection attempt
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
    });

    // Reconnection success
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
    });

    // Reconnection failed
    this.socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after all attempts');
    });

    // Pong response
    this.socket.on('pong', (data) => {
      console.log('🏓 Pong received:', data);
    });

    // Error
    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  }

  private async handleAuthError(): Promise<void> {
    console.log('🔑 Handling authentication error...');
    try {
      const newToken = await AsyncStorage.getItem('access_token');
      if (newToken && this.socket) {
        this.socket.auth = { token: newToken };
        this.socket.connect();
      }
    } catch (error) {
      console.error('Failed to refresh auth:', error);
    }
  }

  private reregisterListeners(): void {
    console.log('📡 Re-registering event listeners after reconnection...');
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        if (this.socket) {
          this.socket.off(event); // Remove old listeners
          this.socket.on(event, (data) => callback(data));
        }
      });
    });
    console.log(`✅ Re-registered ${this.listeners.size} event listeners`);
  }

  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting WebSocket...');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
      this.notifyConnectionStatus(false);
      console.log('✅ WebSocket disconnected');
    }
  }

  on(event: WebSocketEvent | string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    if (this.socket) {
      this.socket.on(event, (data) => {
        console.log(`📥 Event received: ${event}`, data);
        callback(data);
      });
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
      console.log(`📤 Emitting event: ${event}`, data);
      this.socket.emit(event, data);
    } else {
      console.warn(`⚠️ Cannot emit event "${event}", socket not connected`);
    }
  }

  ping(): void {
    if (this.socket?.connected) {
      console.log('🏓 Sending ping...');
      this.socket.emit('ping');
    }
  }

  onConnectionStatusChange(callback: (status: boolean) => void): void {
    this.connectionStatusCallbacks.add(callback);
  }

  offConnectionStatusChange(callback: (status: boolean) => void): void {
    this.connectionStatusCallbacks.delete(callback);
  }

  private notifyConnectionStatus(status: boolean): void {
    this.connectionStatusCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in connection status callback:', error);
      }
    });
  }

  getConnectionStatus(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  isSocketConnected(): boolean {
    return this.socket?.connected === true;
  }
}

export const wsManager = WebSocketManager.getInstance();
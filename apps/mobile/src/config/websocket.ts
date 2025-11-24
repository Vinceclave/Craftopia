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
    reconnectionDelayMax: number;
    timeout: number;
    autoConnect: boolean;
    auth: {
      token: string;
    };
  };
}

// Configuration constants
const WS_CONFIG = {
  MAX_RECONNECT_ATTEMPTS: 10,
  RECONNECTION_DELAY: 1000,
  RECONNECTION_DELAY_MAX: 5000,
  TIMEOUT: 10000,
  HEARTBEAT_INTERVAL: 30000,
  AUTH_RETRY_DELAY: 2000,
};

export const getWebSocketConfig = async (): Promise<WebSocketConfig> => {
  const token = await AsyncStorage.getItem('access_token');
  
  if (!token) {
    throw new Error('No authentication token available');
  }

  return {
    url: API_BASE_URL!,
    options: {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: WS_CONFIG.MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: WS_CONFIG.RECONNECTION_DELAY,
      reconnectionDelayMax: WS_CONFIG.RECONNECTION_DELAY_MAX,
      timeout: WS_CONFIG.TIMEOUT,
      autoConnect: false,
      auth: {
        token,
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
  private connectionStatusCallbacks: Set<(status: boolean) => void> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private connectionPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  async connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    if (this.socket?.connected) {
      return;
    }

    this.connectionPromise = this.establishConnection();
    
    try {
      await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
    }
  }

  private async establishConnection(): Promise<void> {
    try {
      const config = await getWebSocketConfig();

      if (this.socket) {
        this.cleanupSocket();
      }

      this.socket = io(config.url, config.options);
      this.setupSocketListeners();
      this.socket.connect();

      await new Promise<void>((resolve, reject) => {
        if (!this.socket) {
          reject(new Error('Socket initialization failed'));
          return;
        }

        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, WS_CONFIG.TIMEOUT);

        const connectedHandler = () => {
          clearTimeout(timeout);
          this.socket?.off('connect_error', errorHandler);
          resolve();
        };

        const errorHandler = (error: Error) => {
          clearTimeout(timeout);
          this.socket?.off('connect', connectedHandler);
          reject(error);
        };

        this.socket.once('connect', connectedHandler);
        this.socket.once('connect_error', errorHandler);
      });

    } catch (error) {
      this.cleanupSocket();
      throw error;
    }
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.notifyConnectionStatus(true);
      this.startHeartbeat();
      this.reregisterListeners();
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      this.stopHeartbeat();
      this.notifyConnectionStatus(false);

      if (reason === 'io server disconnect') {
        setTimeout(() => {
          if (!this.isConnected) {
            this.socket?.connect();
          }
        }, WS_CONFIG.AUTH_RETRY_DELAY);
      }
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;

      if (error.message.includes('Authentication') || error.message.includes('401')) {
        this.handleAuthError();
      }
    });

    this.socket.on('reconnect_failed', () => {
      // Max reconnection attempts reached
      this.notifyConnectionStatus(false);
    });

    this.socket.on('error', (error) => {
      // Handle socket errors silently
    });
  }

  private async handleAuthError(): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, WS_CONFIG.AUTH_RETRY_DELAY));
      
      const newToken = await AsyncStorage.getItem('access_token');
      if (newToken && this.socket) {
        this.socket.auth = { token: newToken };
      } else {
        this.disconnect();
      }
    } catch (error) {
      this.disconnect();
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.ping();
      }
    }, WS_CONFIG.HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private reregisterListeners(): void {
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        if (this.socket) {
          this.socket.on(event, (data) => {
            callback(data);
          });
        }
      });
    });
  }

  private cleanupSocket(): void {
    this.stopHeartbeat();
    
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.notifyConnectionStatus(false);
  }

  disconnect(): void {
    this.cleanupSocket();
    this.listeners.clear();
    this.connectionStatusCallbacks.clear();
    this.reconnectAttempts = 0;
  }

  on(event: WebSocketEvent | string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    if (this.socket) {
      this.socket.on(event, (data) => {
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
      this.socket.emit(event, data);
    } else {
      throw new Error('WebSocket not connected');
    }
  }

  ping(): void {
    if (this.socket?.connected) {
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
        // Silent fail for connection status callbacks
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

  isConnecting(): boolean {
    return this.connectionPromise !== null;
  }
}

export const wsManager = WebSocketManager.getInstance();
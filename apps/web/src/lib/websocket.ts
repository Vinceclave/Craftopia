// apps/web/src/lib/websocket.ts - FIXED VERSION
import { io, Socket } from 'socket.io-client';

// ✅ FIX: WebSocket should connect to BACKEND server, not frontend
const isDevelopment = import.meta.env.DEV;
console.log(isDevelopment)

// For development: connect to local backend
// For production: use your actual backend WebSocket server URL
const WS_URL = isDevelopment
  ? 'http://localhost:3001'
  : (import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'https://your-backend-server.com');

console.log('🔌 WebSocket connecting to:', WS_URL);

export enum WebSocketEvent {
  // Challenge Events
  CHALLENGE_CREATED = 'challenge:created',
  CHALLENGE_UPDATED = 'challenge:updated',
  CHALLENGE_DELETED = 'challenge:deleted',
  CHALLENGE_COMPLETED = 'challenge:completed',
  CHALLENGE_VERIFIED = 'challenge:verified',
  
  // Points Events
  POINTS_AWARDED = 'points:awarded',
  LEADERBOARD_UPDATED = 'leaderboard:updated',
  
  // Post Events
  POST_CREATED = 'post:created',
  POST_UPDATED = 'post:updated',
  POST_DELETED = 'post:deleted',
  
  // Comment Events
  COMMENT_CREATED = 'comment:created',
  COMMENT_DELETED = 'comment:deleted',
  
  // Report Events
  REPORT_CREATED = 'report:created',
  REPORT_UPDATED = 'report:updated',
  
  // Announcement Events
  ANNOUNCEMENT_CREATED = 'announcement:created',
  ANNOUNCEMENT_UPDATED = 'announcement:updated',
  ANNOUNCEMENT_DELETED = 'announcement:deleted',
  
  // Moderation Events
  CONTENT_MODERATED = 'content:moderated',
  USER_BANNED = 'user:banned',
  USER_ROLE_CHANGED = 'user:role_changed',
  
  // Admin Events
  ADMIN_ALERT = 'admin:alert',
  
  // System Events
  NOTIFICATION = 'notification',
}

type EventCallback = (data: any) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private eventHandlers: Map<string, Set<EventCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('✅ WebSocket already connected');
      return;
    }

    console.log('🔌 Attempting WebSocket connection to:', WS_URL);

    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 10000,
      // Additional options for better compatibility
      withCredentials: false,
      forceNew: true,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected successfully');
      this.reconnectAttempts = 0;
      this.resubscribeEvents();
    });

    this.socket.on('connected', (data) => {
      console.log('🎉 WebSocket server acknowledged connection:', data);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      console.error('❌ WebSocket connection error:', error.message);
      console.error('Attempted URL:', WS_URL);
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('⛔ Max reconnection attempts reached. Please check your backend server.');
      }
    });

    this.socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });

    this.socket.on('pong', () => {
      console.log('🏓 Pong received from server');
    });
  }

  private resubscribeEvents(): void {
    if (!this.socket) return;

    this.eventHandlers.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket?.on(event, callback);
      });
    });

    console.log('🔄 Resubscribed to', this.eventHandlers.size, 'event types');
  }

  on(event: WebSocketEvent | string, callback: EventCallback): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)?.add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: WebSocketEvent | string, callback?: EventCallback): void {
    if (callback) {
      this.eventHandlers.get(event)?.delete(callback);
      this.socket?.off(event, callback);
    } else {
      this.eventHandlers.delete(event);
      this.socket?.off(event);
    }
  }

  emit(event: string, data?: any): void {
    if (!this.socket?.connected) {
      console.warn('⚠️ WebSocket not connected, cannot emit:', event);
      return;
    }
    this.socket.emit(event, data);
  }

  ping(): void {
    this.emit('ping');
  }

  disconnect(): void {
    if (this.socket) {
      console.log('👋 Disconnecting WebSocket');
      this.socket.disconnect();
      this.socket = null;
      this.eventHandlers.clear();
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const websocketService = new WebSocketService();
export default websocketService;
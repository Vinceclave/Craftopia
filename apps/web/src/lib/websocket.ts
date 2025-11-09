// apps/web/src/lib/websocket.ts
import { io, Socket } from 'socket.io-client';

const isDevelopment = import.meta.env.DEV;
const WS_URL = isDevelopment 
  ? 'http://localhost:3001'
  : (import.meta.env.VITE_BASE_URL || 'https://your-production-api.com');

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
    if (this.socket?.connected) return;

    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 10000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
      this.resubscribeEvents();
    });

    this.socket.on('connected', () => {});
    this.socket.on('disconnect', () => {});
    this.socket.on('connect_error', () => {
      this.reconnectAttempts++;
    });

    this.socket.on('error', () => {});
    this.socket.on('pong', () => {});
  }

  private resubscribeEvents(): void {
    if (!this.socket) return;

    this.eventHandlers.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket?.on(event, callback);
      });
    });
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
    if (!this.socket?.connected) return;
    this.socket.emit(event, data);
  }

  ping(): void {
    this.emit('ping');
  }

  disconnect(): void {
    if (this.socket) {
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
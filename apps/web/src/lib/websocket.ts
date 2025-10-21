// apps/web/src/lib/websocket.ts
import { io, Socket } from 'socket.io-client';

const isDevelopment = import.meta.env.DEV;
const WS_URL = isDevelopment 
  ? 'http://localhost:3001'
  : (import.meta.env.VITE_WS_URL || 'https://your-production-api.com');

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

  /**
   * Connect to WebSocket server
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('✅ WebSocket already connected');
      return;
    }

    console.log('🔌 Connecting to WebSocket:', WS_URL);

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

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      this.resubscribeEvents();
    });

    this.socket.on('connected', (data) => {
      console.log('📡 Server acknowledged connection:', data);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
      this.reconnectAttempts++;
    });

    this.socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });

    // Ping/Pong for keeping connection alive
    this.socket.on('pong', (data) => {
      console.log('🏓 Pong received:', data);
    });
  }

  /**
   * Resubscribe to all events after reconnection
   */
  private resubscribeEvents(): void {
    if (!this.socket) return;

    this.eventHandlers.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket?.on(event, callback);
      });
    });

    console.log('🔄 Resubscribed to', this.eventHandlers.size, 'events');
  }

  /**
   * Subscribe to a WebSocket event
   */
  on(event: WebSocketEvent | string, callback: EventCallback): void {
    if (!this.socket) {
      console.warn('⚠️ WebSocket not connected. Event will be queued:', event);
    }

    // Store callback
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)?.add(callback);

    // Subscribe to socket event
    if (this.socket) {
      this.socket.on(event, callback);
      console.log('👂 Subscribed to event:', event);
    }
  }

  /**
   * Unsubscribe from a WebSocket event
   */
  off(event: WebSocketEvent | string, callback?: EventCallback): void {
    if (callback) {
      // Remove specific callback
      this.eventHandlers.get(event)?.delete(callback);
      this.socket?.off(event, callback);
    } else {
      // Remove all callbacks for event
      this.eventHandlers.delete(event);
      this.socket?.off(event);
    }

    console.log('🔇 Unsubscribed from event:', event);
  }

  /**
   * Emit an event to the server
   */
  emit(event: string, data?: any): void {
    if (!this.socket?.connected) {
      console.warn('⚠️ WebSocket not connected. Cannot emit:', event);
      return;
    }

    this.socket.emit(event, data);
    console.log('📤 Emitted event:', event, data);
  }

  /**
   * Send ping to server
   */
  ping(): void {
    this.emit('ping');
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      console.log('👋 Disconnecting WebSocket...');
      this.socket.disconnect();
      this.socket = null;
      this.eventHandlers.clear();
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get socket instance (for advanced usage)
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();

export default websocketService;
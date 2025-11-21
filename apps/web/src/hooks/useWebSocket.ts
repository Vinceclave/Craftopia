// apps/web/src/hooks/useWebSocket.ts
import { useEffect, useCallback, useRef, useState } from 'react';
import { websocketService, WebSocketEvent } from '@/lib/websocket';
import { useAuthStore } from '@/store/authStore';

export const useWebSocket = () => {
  const { token, isAuthenticated } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const connectionAttempted = useRef(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');

    if (isAuthenticated && storedToken && !connectionAttempted.current) {
      websocketService.connect(storedToken);
      connectionAttempted.current = true;

      const checkConnection = setInterval(() => {
        setIsConnected(websocketService.isConnected());
      }, 1000);

      return () => {
        clearInterval(checkConnection);
      };
    }

    if (!isAuthenticated && connectionAttempted.current) {
      websocketService.disconnect();
      connectionAttempted.current = false;
      setIsConnected(false);
    }
  }, [isAuthenticated, token]);

  const subscribe = useCallback((event: WebSocketEvent | string, callback: (data: any) => void) => {
    websocketService.on(event, callback);
    return () => websocketService.off(event, callback);
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    websocketService.emit(event, data);
  }, []);

  const ping = useCallback(() => {
    websocketService.ping();
  }, []);

  return {
    isConnected,
    subscribe,
    emit,
    ping,
  };
};

// ----------------------------
// Specialized Hooks
// ----------------------------

export const useWebSocketNotifications = (onNotification: (data: any) => void) => {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe(WebSocketEvent.NOTIFICATION, onNotification);
    return unsubscribe;
  }, [subscribe, onNotification]);
};

export const useWebSocketAdminAlerts = (onAlert: (data: any) => void) => {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe(WebSocketEvent.ADMIN_ALERT, onAlert);
    return unsubscribe;
  }, [subscribe, onAlert]);
};

export const useWebSocketChallenges = (callbacks: {
  onCreated?: (data: any) => void;
  onUpdated?: (data: any) => void;
  onDeleted?: (data: any) => void;
  onCompleted?: (data: any) => void;
  onVerified?: (data: any) => void;
}) => {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    if (callbacks.onCreated) {
      unsubscribers.push(subscribe(WebSocketEvent.CHALLENGE_CREATED, callbacks.onCreated));
    }
    if (callbacks.onUpdated) {
      unsubscribers.push(subscribe(WebSocketEvent.CHALLENGE_UPDATED, callbacks.onUpdated));
    }
    if (callbacks.onDeleted) {
      unsubscribers.push(subscribe(WebSocketEvent.CHALLENGE_DELETED, callbacks.onDeleted));
    }
    if (callbacks.onCompleted) {
      unsubscribers.push(subscribe(WebSocketEvent.CHALLENGE_COMPLETED, callbacks.onCompleted));
    }
    if (callbacks.onVerified) {
      unsubscribers.push(subscribe(WebSocketEvent.CHALLENGE_VERIFIED, callbacks.onVerified));
    }

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [subscribe, callbacks]);
};

export const useWebSocketPosts = (callbacks: {
  onCreated?: (data: any) => void;
  onUpdated?: (data: any) => void;
  onDeleted?: (data: any) => void;
}) => {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    if (callbacks.onCreated) {
      unsubscribers.push(subscribe(WebSocketEvent.POST_CREATED, callbacks.onCreated));
    }
    if (callbacks.onUpdated) {
      unsubscribers.push(subscribe(WebSocketEvent.POST_UPDATED, callbacks.onUpdated));
    }
    if (callbacks.onDeleted) {
      unsubscribers.push(subscribe(WebSocketEvent.POST_DELETED, callbacks.onDeleted));
    }

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [subscribe, callbacks]);
};

export const useWebSocketReports = (callbacks: {
  onCreated?: (data: any) => void;
  onUpdated?: (data: any) => void;
  onResolved?: (data: any) => void;
}) => {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    if (callbacks.onCreated) {
      unsubscribers.push(subscribe(WebSocketEvent.REPORT_CREATED, callbacks.onCreated));
    }
    if (callbacks.onUpdated) {
      unsubscribers.push(subscribe(WebSocketEvent.REPORT_UPDATED, callbacks.onUpdated));
    }

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [subscribe, callbacks]);
};

export const useWebSocketUsers = (callbacks: {
  onBanned?: (data: any) => void;
  onRoleChanged?: (data: any) => void;
}) => {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    if (callbacks.onBanned) {
      unsubscribers.push(subscribe(WebSocketEvent.USER_BANNED, callbacks.onBanned));
    }
    if (callbacks.onRoleChanged) {
      unsubscribers.push(subscribe(WebSocketEvent.USER_ROLE_CHANGED, callbacks.onRoleChanged));
    }

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [subscribe, callbacks]);
};

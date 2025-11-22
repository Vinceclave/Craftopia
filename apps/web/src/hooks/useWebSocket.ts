// apps/web/src/hooks/useWebSocket.ts - UPDATED WITH SPONSOR SUPPORT
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

// ----------------------------
// CENTRALIZED SPONSOR HOOKS
// ----------------------------

export const useWebSocketSponsors = (callbacks: {
  onSponsorCreated?: (data: any) => void;
  onSponsorUpdated?: (data: any) => void;
  onSponsorDeleted?: (data: any) => void;
  onRewardCreated?: (data: any) => void;
  onRewardUpdated?: (data: any) => void;
  onRewardDeleted?: (data: any) => void;
  onRewardRedeemed?: (data: any) => void;
  onRedemptionCreated?: (data: any) => void;
  onRedemptionFulfilled?: (data: any) => void;
  onRedemptionCancelled?: (data: any) => void;
}) => {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // Sponsor events
    if (callbacks.onSponsorCreated) {
      unsubscribers.push(subscribe(WebSocketEvent.SPONSOR_CREATED, callbacks.onSponsorCreated));
    }
    if (callbacks.onSponsorUpdated) {
      unsubscribers.push(subscribe(WebSocketEvent.SPONSOR_UPDATED, callbacks.onSponsorUpdated));
    }
    if (callbacks.onSponsorDeleted) {
      unsubscribers.push(subscribe(WebSocketEvent.SPONSOR_DELETED, callbacks.onSponsorDeleted));
    }

    // Reward events
    if (callbacks.onRewardCreated) {
      unsubscribers.push(subscribe(WebSocketEvent.REWARD_CREATED, callbacks.onRewardCreated));
    }
    if (callbacks.onRewardUpdated) {
      unsubscribers.push(subscribe(WebSocketEvent.REWARD_UPDATED, callbacks.onRewardUpdated));
    }
    if (callbacks.onRewardDeleted) {
      unsubscribers.push(subscribe(WebSocketEvent.REWARD_DELETED, callbacks.onRewardDeleted));
    }
    if (callbacks.onRewardRedeemed) {
      unsubscribers.push(subscribe(WebSocketEvent.REWARD_REDEEMED, callbacks.onRewardRedeemed));
    }

    // Redemption events
    if (callbacks.onRedemptionCreated) {
      unsubscribers.push(subscribe(WebSocketEvent.REDEMPTION_CREATED, callbacks.onRedemptionCreated));
    }
    if (callbacks.onRedemptionFulfilled) {
      unsubscribers.push(subscribe(WebSocketEvent.REDEMPTION_FULFILLED, callbacks.onRedemptionFulfilled));
    }
    if (callbacks.onRedemptionCancelled) {
      unsubscribers.push(subscribe(WebSocketEvent.REDEMPTION_CANCELLED, callbacks.onRedemptionCancelled));
    }

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [subscribe, callbacks]);
};
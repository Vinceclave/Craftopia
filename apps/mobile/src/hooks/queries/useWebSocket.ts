import { useEffect, useCallback, useRef, useState } from 'react';
import { wsManager, WebSocketEvent } from '~/config/websocket';
import { useAuth } from '~/context/AuthContext';

export const useWebSocket = () => {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const connectionAttempted = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !connectionAttempted.current) {
      connectionAttempted.current = true;
      
      wsManager.connect().catch(err => {
        console.error('WebSocket connection failed:', err);
      });

      wsManager.onConnectionStatusChange((status) => {
        setIsConnected(status);
      });
    }

    return () => {
      if (!isAuthenticated) {
        wsManager.disconnect();
        connectionAttempted.current = false;
      }
    };
  }, [isAuthenticated]);

  const subscribe = useCallback((event: WebSocketEvent | string, callback: Function) => {
    wsManager.on(event, callback);
    return () => wsManager.off(event, callback);
  }, []);

  const emit = useCallback((event: string, data: any) => {
    wsManager.emit(event, data);
  }, []);

  return {
    isConnected,
    subscribe,
    emit,
    connectionStatus: wsManager.getConnectionStatus(),
  };
};

export { WebSocketEvent };  
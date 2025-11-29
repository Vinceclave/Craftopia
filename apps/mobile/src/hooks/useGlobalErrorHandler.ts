// apps/mobile/src/hooks/useGlobalErrorHandler.ts
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';

export const useGlobalErrorHandler = () => {
  const [isOffline, setIsOffline] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = !state.isConnected;
      setIsOffline(offline);
    });

    return () => unsubscribe();
  }, []);

  const handleRetry = async () => {
    const state = await NetInfo.fetch();
    
    if (state.isConnected) {
      await queryClient.invalidateQueries();
    }
  };

  return {
    isOffline,
    handleRetry,
  };
};
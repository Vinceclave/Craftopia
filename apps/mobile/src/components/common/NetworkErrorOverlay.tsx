// apps/mobile/src/components/common/NetworkErrorOverlay.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react-native';
import NetInfo from '@react-native-community/netinfo';

interface NetworkErrorOverlayProps {
  visible: boolean;
  onRetry?: () => void;
}

export const NetworkErrorOverlay: React.FC<NetworkErrorOverlayProps> = ({ 
  visible, 
  onRetry 
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    // Check initial state
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    // Check network connection
    const state = await NetInfo.fetch();
    setIsConnected(state.isConnected);
    
    if (state.isConnected && onRetry) {
      onRetry();
    }
    
    setTimeout(() => setIsRetrying(false), 1000);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/90">
        {/* Centered Content */}
        <View className="flex-1 justify-center items-center px-6">
          {/* Icon Container */}
          <View className="w-24 h-24 rounded-full bg-craftopia-error/20 items-center justify-center mb-6">
            <WifiOff size={48} color="#D66B4E" strokeWidth={2} />
          </View>

          {/* Title */}
          <Text className="text-2xl font-poppinsBold text-white text-center mb-3">
            No Internet Connection
          </Text>

          {/* Description */}
          <Text className="text-base font-nunito text-white/80 text-center mb-6 px-4 leading-6">
            Please check your internet connection and try again. Some features may be unavailable while offline.
          </Text>

          {/* Connection Status */}
          <View className="bg-white/10 rounded-xl px-4 py-3 mb-6 flex-row items-center">
            <View className={`w-3 h-3 rounded-full mr-3 ${
              isConnected === null 
                ? 'bg-gray-400' 
                : isConnected 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
            }`} />
            <Text className="text-sm font-nunito text-white">
              {isConnected === null 
                ? 'Checking connection...' 
                : isConnected 
                  ? 'Connected' 
                  : 'Disconnected'}
            </Text>
          </View>

          {/* Retry Button */}
          <TouchableOpacity
            onPress={handleRetry}
            disabled={isRetrying}
            className="bg-craftopia-primary rounded-2xl px-8 py-4 flex-row items-center justify-center min-w-[200px]"
            activeOpacity={0.8}
          >
            {isRetrying ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text className="text-base font-poppinsBold text-white ml-2">
                  Retrying...
                </Text>
              </>
            ) : (
              <>
                <RefreshCw size={20} color="#FFFFFF" />
                <Text className="text-base font-poppinsBold text-white ml-2">
                  Try Again
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom Info */}
        <View className="pb-8 px-6">
          <Text className="text-xs font-nunito text-white/50 text-center">
            You'll be able to continue once your connection is restored
          </Text>
        </View>
      </View>
    </Modal>
  );
};
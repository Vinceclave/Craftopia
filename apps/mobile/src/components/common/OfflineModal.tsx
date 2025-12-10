import React from 'react';
import { View, Text, Modal } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';

export const OfflineModal = () => {
    const netInfo = useNetInfo();

    // netInfo.isConnected can be null initially while fetching the state.
    // We only want to block the screen if we are certain there is no connection (false).
    const isOffline = netInfo.isConnected === false;

    if (!isOffline) {
        return null;
    }

    return (
        <Modal
            transparent
            animationType="fade"
            visible={true}
            statusBarTranslucent
            onRequestClose={() => {
                // Prevent closing by back button on Android
            }}
        >
            <View className="flex-1 bg-black/60 justify-center items-center px-6">
                <View
                    className="bg-craftopia-surface p-6 rounded-2xl w-full max-w-sm items-center"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.25,
                        shadowRadius: 25,
                        elevation: 10,
                    }}
                >
                    {/* Icon Container */}
                    <View className="w-16 h-16 bg-[#D66B4E12] rounded-full items-center justify-center mb-4">
                        <WifiOff size={32} color="#D66B4E" />
                    </View>

                    {/* Title */}
                    <Text className="text-xl font-bold text-center text-craftopia-textPrimary mb-3 font-poppinsBold">
                        No Internet Connection
                    </Text>

                    {/* Message */}
                    <Text className="text-base text-center text-craftopia-textSecondary font-nunito leading-relaxed">
                        Please check your internet settings and try again. The app will reconnect automatically once internet is available.
                    </Text>
                </View>
            </View>
        </Modal>
    );
};

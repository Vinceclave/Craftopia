// apps/mobile/src/components/common/ActionSheet.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';

export interface ActionSheetOption {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface ActionSheetProps {
  visible: boolean;
  title?: string;
  message?: string;
  options: ActionSheetOption[];
  onClose: () => void;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  title,
  message,
  options,
  onClose,
}) => {
  const handleOptionPress = (option: ActionSheetOption) => {
    onClose();
    // Delay action slightly to allow modal to close smoothly
    setTimeout(() => {
      option.onPress();
    }, 100);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View className="bg-craftopia-surface rounded-t-2xl" style={{ 
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}>
          {/* Handle Bar */}
          <View className="items-center pt-3 pb-2">
            <View 
              className="w-10 h-1 bg-gray-300 rounded-full" 
              style={{ backgroundColor: '#D1D5DB' }}
            />
          </View>

          {/* Header */}
          {(title || message) && (
            <View className="px-5 py-3 border-b border-gray-200" style={{ borderBottomColor: '#E5E7EB' }}>
              {title && (
                <Text 
                  className="text-lg font-semibold text-craftopia-textPrimary text-center mb-1"
                  style={{ color: '#1A1A1A', fontSize: 18, fontWeight: '600' }}
                >
                  {title}
                </Text>
              )}
              {message && (
                <Text 
                  className="text-sm text-craftopia-textSecondary text-center"
                  style={{ color: '#6B7280', fontSize: 14 }}
                >
                  {message}
                </Text>
              )}
            </View>
          )}

          {/* Options */}
          <ScrollView 
            className="max-h-96"
            showsVerticalScrollIndicator={false}
          >
            <View className="py-2">
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleOptionPress(option)}
                  className="px-5 py-4 border-b border-gray-100"
                  style={{ 
                    borderBottomColor: '#F3F4F6',
                    borderBottomWidth: index < options.length - 1 ? 1 : 0,
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-center text-base font-medium ${
                      option.style === 'destructive'
                        ? 'text-red-600'
                        : option.style === 'cancel'
                        ? 'text-gray-600'
                        : 'text-craftopia-primary'
                    }`}
                    style={{
                      fontSize: 16,
                      fontWeight: option.style === 'cancel' ? '400' : '500',
                      color: option.style === 'destructive' 
                        ? '#DC2626' 
                        : option.style === 'cancel'
                        ? '#6B7280'
                        : '#374A36',
                    }}
                  >
                    {option.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Safe area bottom padding */}
          <View className="h-8" />
        </View>
      </View>
    </Modal>
  );
};

// Hook for easier usage
export const useActionSheet = () => {
  const [visible, setVisible] = React.useState(false);
  const [config, setConfig] = React.useState<{
    title?: string;
    message?: string;
    options: ActionSheetOption[];
  }>({
    options: [],
  });

  const show = (
    title: string | undefined,
    message: string | undefined,
    options: ActionSheetOption[]
  ) => {
    setConfig({ title, message, options });
    setVisible(true);
  };

  const hide = () => {
    setVisible(false);
  };

  return {
    visible,
    config,
    show,
    hide,
  };
};
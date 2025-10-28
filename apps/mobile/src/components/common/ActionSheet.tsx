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
import { X, AlertCircle } from 'lucide-react-native';

export interface ActionSheetOption {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
  icon?: React.ReactNode;
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
    setTimeout(() => {
      option.onPress();
    }, 100);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View 
          className="bg-white rounded-t-3xl overflow-hidden"
          style={{ 
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          {/* Handle Bar */}
          <View className="items-center pt-3 pb-2">
            <View 
              className="w-12 h-1 rounded-full" 
              style={{ backgroundColor: '#D1D5DB' }}
            />
          </View>

          {/* Header */}
          {(title || message) && (
            <View className="px-6 py-4 border-b" style={{ borderBottomColor: '#F3F4F6' }}>
              {title && (
                <Text 
                  className="text-lg font-bold text-center mb-1"
                  style={{ color: '#1A1A1A', fontSize: 18 }}
                >
                  {title}
                </Text>
              )}
              {message && (
                <Text 
                  className="text-sm text-center"
                  style={{ color: '#6B7280', fontSize: 14, lineHeight: 20 }}
                >
                  {message}
                </Text>
              )}
            </View>
          )}

          {/* Options */}
          <ScrollView 
            style={{ maxHeight: 400 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="py-2">
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleOptionPress(option)}
                  className="px-6 py-4 flex-row items-center justify-center"
                  style={{ 
                    borderBottomColor: '#F3F4F6',
                    borderBottomWidth: index < options.length - 1 ? 1 : 0,
                  }}
                  activeOpacity={0.7}
                >
                  {option.icon && (
                    <View className="mr-3">
                      {option.icon}
                    </View>
                  )}
                  <Text
                    className="text-base font-semibold"
                    style={{
                      fontSize: 16,
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
          <View style={{ height: Platform.OS === 'ios' ? 34 : 16 }} />
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
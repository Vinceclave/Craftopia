// Enhanced ActionSheet with additional features
import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { Check } from 'lucide-react-native';

export interface ActionSheetOption {
  text: string;
  onPress: () => void;
  icon?: React.ReactNode;
  style?: 'default' | 'destructive' | 'cancel';
}

export interface ActionSheetProps {
  visible: boolean;
  title?: string;
  message?: string;
  options: ActionSheetOption[];
  onClose: () => void;
}


interface EnhancedActionSheetProps extends ActionSheetProps {
  maxHeight?: number;
  showSelectedIndicator?: boolean;
  selectedValue?: string;
  showIcons?: boolean;
  cancelText?: string;
}

export const ActionSheet: React.FC<EnhancedActionSheetProps> = ({
  visible,
  title,
  message,
  options,
  onClose,
  maxHeight = 400,
  showSelectedIndicator = false,
  selectedValue,
  showIcons = true,
  cancelText = 'Cancel',
}) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const { height: screenHeight } = Dimensions.get('window');

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 300,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: 300,
        useNativeDriver: true,
        damping: 20,
      }).start();
    }
  }, [visible]);

  const handleOptionPress = (option: ActionSheetOption) => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      setTimeout(() => {
        option.onPress();
      }, 100);
    });
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(onClose);
  };

  // Separate cancel option from other options
  const cancelOption = options.find(opt => opt.style === 'cancel');
  const otherOptions = options.filter(opt => opt.style !== 'cancel');

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View 
        className="flex-1 justify-end" 
        style={{ 
          backgroundColor: 'rgba(0,0,0,0.5)',
          paddingTop: Platform.OS === 'ios' ? 44 : 0,
        }}
      >
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={handleClose}
        />
        
        <Animated.View 
          className="bg-white rounded-t-3xl overflow-hidden"
          style={{ 
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
            transform: [{ translateY: slideAnim }],
            maxHeight: screenHeight * 0.8,
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
            style={{ maxHeight }}
            showsVerticalScrollIndicator={false}
            bounces={otherOptions.length > 5}
          >
            <View className="py-2">
              {otherOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleOptionPress(option)}
                  className="px-6 py-4 flex-row items-center justify-between"
                  style={{ 
                    borderBottomColor: '#F3F4F6',
                    borderBottomWidth: index < otherOptions.length - 1 ? 1 : 0,
                  }}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center flex-1">
                    {showIcons && option.icon && (
                      <View className="mr-3">
                        {option.icon}
                      </View>
                    )}
                    <Text
                      className="text-base font-semibold flex-1"
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
                  </View>
                  
                  {showSelectedIndicator && selectedValue === option.text && (
                    <Check size={20} color="#374A36" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Cancel Button */}
          {cancelOption && (
            <View className="px-6 py-2 border-t" style={{ borderTopColor: '#F3F4F6' }}>
              <TouchableOpacity
                onPress={() => handleOptionPress(cancelOption)}
                className="py-4 rounded-xl items-center"
                style={{ backgroundColor: '#F3F4F6' }}
                activeOpacity={0.7}
              >
                <Text
                  className="text-base font-semibold"
                  style={{ color: '#6B7280' }}
                >
                  {cancelOption.text || cancelText}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Safe area bottom padding */}
          <View style={{ height: Platform.OS === 'ios' ? 34 : 16 }} />
        </Animated.View>
      </View>
    </Modal>
  );
};

// Enhanced hook with promise-based API
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

  // Promise-based show function that returns the selected option
  const showAsync = (
    title: string | undefined,
    message: string | undefined,
    options: ActionSheetOption[]
  ): Promise<ActionSheetOption | null> => {
    return new Promise((resolve) => {
      const enhancedOptions = options.map(option => ({
        ...option,
        onPress: () => {
          resolve(option);
        },
      }));

      // Add cancel option that resolves with null
      enhancedOptions.push({
        text: 'Cancel',
        style: 'cancel',
        onPress: () => resolve(null),
      });

      setConfig({ title, message, options: enhancedOptions });
      setVisible(true);
    });
  };

  const hide = () => {
    setVisible(false);
  };

  return {
    visible,
    config,
    show,
    showAsync,
    hide,
  };
};
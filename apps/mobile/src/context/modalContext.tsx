// apps/mobile/src/context/modalContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react-native';

export interface ModalConfig {
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

interface ModalContextType {
  showModal: (config: ModalConfig) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Singleton service to access modal outside of React components
export class ModalService {
  private static showModalFn: ((config: ModalConfig) => void) | null = null;
  private static hideModalFn: (() => void) | null = null;

  static setMethods(show: (config: ModalConfig) => void, hide: () => void) {
    this.showModalFn = show;
    this.hideModalFn = hide;
  }

  static show(config: ModalConfig) {
    if (this.showModalFn) {
      this.showModalFn(config);
    } else {
      console.warn('ModalService not initialized yet');
    }
  }

  static hide() {
    if (this.hideModalFn) {
      this.hideModalFn();
    }
  }
}

const CustomModal: React.FC<{ config: ModalConfig; onClose: () => void }> = ({ config, onClose }) => {
  const getIcon = () => {
    switch (config.type) {
      case 'success': return <CheckCircle size={32} color="#5BA776" />;
      case 'error': return <XCircle size={32} color="#D66B4E" />;
      case 'warning': return <AlertTriangle size={32} color="#E3A84F" />;
      default: return <Info size={32} color="#3B6E4D" />;
    }
  };

  const getBackgroundColor = () => {
    switch (config.type) {
      case 'success': return '#5BA77612';
      case 'error': return '#D66B4E12';
      case 'warning': return '#E3A84F12';
      default: return '#3B6E4D12';
    }
  };

  const handleConfirm = () => {
    config.onConfirm?.();
    onClose();
  };

  const handleCancel = () => {
    config.onCancel?.();
    onClose();
  };

  return (
    <Modal transparent animationType="fade" visible={true}>
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View 
          className="bg-craftopia-surface rounded-2xl p-6 w-full max-w-sm"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 25,
            elevation: 10,
          }}
        >
          {/* Icon */}
          <View 
            className="w-16 h-16 rounded-2xl items-center justify-center mb-4 self-center"
            style={{ backgroundColor: getBackgroundColor() }}
          >
            {getIcon()}
          </View>

          {/* Title */}
          <Text className="text-xl font-bold text-center mb-3 text-craftopia-textPrimary font-poppinsBold">
            {config.title}
          </Text>

          {/* Message */}
          <Text className="text-base text-center mb-6 leading-relaxed text-craftopia-textSecondary font-nunito">
            {config.message}
          </Text>

          {/* Buttons */}
          <View className="space-y-3">
            {config.onConfirm && (
              <TouchableOpacity
                onPress={handleConfirm}
                className="rounded-xl py-4 items-center bg-craftopia-primary"
              >
                <Text className="text-white font-bold text-lg font-nunito">
                  {config.confirmText || 'OK'}
                </Text>
              </TouchableOpacity>
            )}

            {config.onCancel && (
              <TouchableOpacity
                onPress={handleCancel}
                className="bg-craftopia-light rounded-xl py-4 items-center"
              >
                <Text className="font-bold text-lg text-craftopia-textSecondary font-nunito">
                  {config.cancelText || 'Cancel'}
                </Text>
              </TouchableOpacity>
            )}

            {!config.onConfirm && !config.onCancel && (
              <TouchableOpacity
                onPress={onClose}
                className="rounded-xl py-4 items-center bg-craftopia-primary"
              >
                <Text className="text-white font-bold text-lg font-nunito">OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modal, setModal] = useState<ModalConfig | null>(null);

  const showModal = (config: ModalConfig) => {
    setModal(config);
  };

  const hideModal = () => {
    setModal(null);
  };

  // Register methods in ModalService for static access
  useEffect(() => {
    ModalService.setMethods(showModal, hideModal);
  }, []);

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {modal && <CustomModal config={modal} onClose={hideModal} />}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
};
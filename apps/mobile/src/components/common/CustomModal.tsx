import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react-native';
import type { ModalConfig } from '~/context/modalContext';

interface CustomModalProps {
  config: ModalConfig;
  onClose: () => void;
}

export const CustomModal: React.FC<CustomModalProps> = ({ config, onClose }) => {
  const getIcon = () => {
    switch (config.type) {
      case 'success': return <CheckCircle size={32} color="#7C9885" />;
      case 'error': return <XCircle size={32} color="#FF6B6B" />;
      case 'warning': return <AlertTriangle size={32} color="#FF6700" />;
      default: return <Info size={32} color="#004E98" />;
    }
  };

  const getBackgroundColor = () => {
    switch (config.type) {
      case 'success': return '#7C988512';
      case 'error': return '#FF6B6B12';
      case 'warning': return '#FF670012';
      default: return '#004E9812';
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
          className="bg-white rounded-2xl p-6 w-full max-w-sm"
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
          <Text className="text-xl font-bold text-center mb-3" style={{ color: '#004E98' }}>
            {config.title}
          </Text>

          {/* Message */}
          <Text className="text-base text-center mb-6 leading-relaxed" style={{ color: '#333333' }}>
            {config.message}
          </Text>

          {/* Buttons */}
          <View className="space-y-3">
            {config.onConfirm && (
              <TouchableOpacity
                onPress={handleConfirm}
                className="bg-blue-600 rounded-xl py-4 items-center"
                style={{ backgroundColor: '#004E98' }}
              >
                <Text className="text-white font-bold text-lg">
                  {config.confirmText || 'OK'}
                </Text>
              </TouchableOpacity>
            )}

            {config.onCancel && (
              <TouchableOpacity
                onPress={handleCancel}
                className="bg-gray-200 rounded-xl py-4 items-center"
              >
                <Text className="font-bold text-lg" style={{ color: '#333333' }}>
                  {config.cancelText || 'Cancel'}
                </Text>
              </TouchableOpacity>
            )}

            {!config.onConfirm && !config.onCancel && (
              <TouchableOpacity
                onPress={onClose}
                className="bg-blue-600 rounded-xl py-4 items-center"
                style={{ backgroundColor: '#004E98' }}
              >
                <Text className="text-white font-bold text-lg">OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};
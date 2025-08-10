import React from 'react';
import { Modal, View, Pressable } from 'react-native';
import { MotiView, MotiText } from 'moti';

interface ErrorModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  title = 'Validation Error',
  message,
  onClose,
}) => {
  return (
    <>
      <Modal transparent visible={visible} animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 250 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg"
          >
            <MotiText className="text-lg font-luckiest text-red-600 mb-2">
              {title}
            </MotiText>
            <MotiText className="text-darkgray font-openSans mb-4">
              {message}
            </MotiText>

            <Pressable
              onPress={onClose}
              className="bg-forest py-3 rounded-xl active:opacity-80"
            >
              <MotiText className="text-white text-center font-semibold">
                OK
              </MotiText>
            </Pressable>
          </MotiView>
        </View>
      </Modal>
    </>
  );
};

export default ErrorModal;

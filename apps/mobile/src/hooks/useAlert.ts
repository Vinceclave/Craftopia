import { useModal } from "~/context/modalContext";

// apps/mobile/src/hooks/useAlert.ts

export const useAlert = () => {
  const { showModal } = useModal();

  const alert = (title: string, message: string, onPress?: () => void) => {
    showModal({
      title,
      message,
      onConfirm: onPress,
      type: 'info',
    });
  };

  const success = (title: string, message: string, onPress?: () => void) => {
    showModal({
      title,
      message,
      onConfirm: onPress,
      type: 'success',
    });
  };

  const error = (title: string, message: string, onPress?: () => void) => {
    showModal({
      title,
      message,
      onConfirm: onPress,
      type: 'error',
    });
  };

  const warning = (title: string, message: string, onPress?: () => void) => {
    showModal({
      title,
      message,
      onConfirm: onPress,
      type: 'warning',
    });
  };

  const confirm = (
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void
  ) => {
    showModal({
      title,
      message,
      onConfirm,
      onCancel,
      confirmText: 'Yes',
      cancelText: 'No',
      type: 'warning',
    });
  };

  return { alert, success, error, warning, confirm };
};
// apps/web/src/components/ToastNotification.tsx
import { useToast } from '@/hooks/useToast';
import { useWebSocketNotifications, useWebSocketAdminAlerts } from '@/hooks/useWebSocket';

export const WebSocketToastProvider = () => {
  const { success, error, info, warning } = useToast();

  // Handle general notifications
  useWebSocketNotifications((data) => {
    const message = data.message || 'New notification';
    const priority = data.priority || 'normal';

    if (priority === 'high') {
      warning(message);
    } else {
      info(message);
    }
  });

  // Handle admin alerts
  useWebSocketAdminAlerts((data) => {
    const message = data.message || 'Admin alert';
    const severity = data.severity || 'info';

    switch (severity) {
      case 'error':
      case 'critical':
        error(message);
        break;
      case 'warning':
        warning(message);
        break;
      case 'success':
        success(message);
        break;
      default:
        info(message);
    }
  });

  return null; // No UI needed, just effects
};
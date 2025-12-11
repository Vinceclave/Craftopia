// apps/web/src/components/ToastNotification.tsx
import { useToast } from '@/components/ui/use-toast';
import { useWebSocketNotifications, useWebSocketAdminAlerts } from '@/hooks/useWebSocket';

export const WebSocketToastProvider = () => {
  const { toast } = useToast();

  // Handle general notifications
  useWebSocketNotifications((data) => {
    const message = data.message || 'New notification';
    const priority = data.priority || 'normal';

    if (priority === 'high') {
      toast({
        title: 'Notification',
        description: message,
        variant: 'default', // Using default unless there's a warning variant
      });
    } else {
      toast({
        title: 'Notification',
        description: message,
      });
    }
  });

  // Handle admin alerts
  useWebSocketAdminAlerts((data) => {
    const message = data.message || 'Admin alert';
    const severity = data.severity || 'info';

    switch (severity) {
      case 'error':
      case 'critical':
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
        break;
      case 'warning':
        toast({
          title: 'Warning',
          description: message,
        });
        break;
      case 'success':
        toast({
          title: 'Success',
          description: message,
        });
        break;
      default:
        toast({
          title: 'Info',
          description: message,
        });
    }
  });

  return null; // No UI needed, just effects
};
import { useToast } from '@/hooks/useToast';
import { useWebSocketNotifications, useWebSocketAdminAlerts } from '@/hooks/useWebSocket';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastNotifications = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg border flex items-start gap-3 animate-in slide-in-from-right duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : toast.type === 'warning'
              ? 'bg-orange-50 border-orange-200 text-orange-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />}
          
          <div className="flex-1">
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
          
          <button
            onClick={() => removeToast(toast.id)}
            className="text-current opacity-50 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export const WebSocketToastProvider = () => {
  const { success, error, info, warning } = useToast();

  // Handle general notifications
  useWebSocketNotifications((data) => {
    console.log('📨 WebSocket Notification:', data);
    
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
    console.log('🚨 Admin Alert:', data);
    
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

  return <ToastNotifications />;
};
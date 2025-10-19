import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../lib/api';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardAPI.getStats,
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useActivityLogs = (days = 7) => {
  return useQuery({
    queryKey: ['activity-logs', days],
    queryFn: () => dashboardAPI.getActivityLogs(days),
  });
};

export const useTopUsers = (limit = 10) => {
  return useQuery({
    queryKey: ['top-users', limit],
    queryFn: () => dashboardAPI.getTopUsers(limit),
  });
};

export const useRecentActivity = (limit = 20) => {
  return useQuery({
    queryKey: ['recent-activity', limit],
    queryFn: () => dashboardAPI.getRecentActivity(limit),
  });
};

// apps/web/src/hooks/useToast.ts (COMPLETE VERSION)
import { useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, message, type };
    
    setToasts((prev) => [...prev, toast]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
    success: (message: string) => showToast(message, 'success'),
    error: (message: string) => showToast(message, 'error'),
    info: (message: string) => showToast(message, 'info'),
    warning: (message: string) => showToast(message, 'warning'),
  };
};
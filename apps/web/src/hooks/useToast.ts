// apps/web/src/hooks/useToast.ts
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => string;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  clearAll: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useToast = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (message: string, type: ToastType = 'info', duration = 5000) => {
    const id = generateId();
    const toast: Toast = { id, message, type, duration };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  success: (message: string, duration?: number) => {
    get().addToast(message, 'success', duration);
  },

  error: (message: string, duration?: number) => {
    get().addToast(message, 'error', duration);
  },

  info: (message: string, duration?: number) => {
    get().addToast(message, 'info', duration);
  },

  warning: (message: string, duration?: number) => {
    get().addToast(message, 'warning', duration);
  },

  clearAll: () => {
    set({ toasts: [] });
  },
}));
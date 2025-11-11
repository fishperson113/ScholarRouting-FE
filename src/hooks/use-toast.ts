import { useCallback } from 'react';
import { useNotifications } from '@/components/ui/notifications';

type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastOptions {
  title: string;
  message?: string;
}

export const useToast = () => {
  const { addNotification } = useNotifications();

  const toast = useCallback(
    (type: ToastType, options: ToastOptions) => {
      addNotification({
        type,
        title: options.title,
        message: options.message,
      });
    },
    [addNotification],
  );

  return {
    toast,
    success: (options: ToastOptions) => toast('success', options),
    error: (options: ToastOptions) => toast('error', options),
    warning: (options: ToastOptions) => toast('warning', options),
    info: (options: ToastOptions) => toast('info', options),
  };
};

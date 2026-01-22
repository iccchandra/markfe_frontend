import { useNotification } from '../contexts/NotificationContext';
import { useCallback } from 'react';

export interface UseNotificationsReturn {
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
  remove: (id: string) => void;
  clear: () => void;
  
  // Common patterns
  apiSuccess: (action: string) => string;
  apiError: (action: string, error?: any) => string;
  confirm: (message: string, onConfirm: () => void) => string;
  loading: (message: string) => string;
}

export const useNotifications = (): UseNotificationsReturn => {
  const notification = useNotification();

  const apiSuccess = useCallback((action: string) => {
    return notification.success(
      'Success',
      `${action} completed successfully.`
    );
  }, [notification]);

  const apiError = useCallback((action: string, error?: any) => {
    const message = error?.response?.data?.message || error?.message || `Failed to ${action.toLowerCase()}.`;
    return notification.error(
      'Error',
      message
    );
  }, [notification]);

  const confirm = useCallback((message: string, onConfirm: () => void) => {
    return notification.warning(
      'Confirmation Required',
      message,
      {
        persistent: true,
        action: {
          label: 'Confirm',
          onClick: onConfirm,
        },
      }
    );
  }, [notification]);

  const loading = useCallback((message: string) => {
    return notification.info(
      'Loading',
      message,
      {
        persistent: true,
        progress: false,
      }
    );
  }, [notification]);

  return {
    success: notification.success,
    error: notification.error,
    warning: notification.warning,
    info: notification.info,
    remove: notification.removeNotification,
    clear: notification.clearNotifications,
    apiSuccess,
    apiError,
    confirm,
    loading,
  };
};
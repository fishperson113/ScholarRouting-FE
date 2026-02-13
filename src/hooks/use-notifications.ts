import { useNotificationContext, Notification, NotificationType } from '@/components/notifications/notification-provider';

// Re-export types for backward compatibility
export type { Notification, NotificationType };

// Simplified Hook: Just consumes the Context
export const useNotifications = () => {
    return useNotificationContext();
};

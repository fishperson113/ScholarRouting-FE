// Replace Firestore imports with API calls
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/lib/auth';
import { getNotifications, markNotificationRead } from '@/lib/api-client';

export type NotificationType =
    | 'DEADLINE_WARNING'
    | 'DEADLINE_MISSED'
    | 'APPLICATION_ADDED'
    | 'APPLICATION_STATUS'
    | 'SCHOLARSHIP_MATCH'
    | 'SYSTEM_ALERT';

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: any;
    link?: string;
    metadata?: {
        scholarshipId?: string;
        applicationId?: string;
        daysLeft?: number;
        [key: string]: any;
    };
}

export const useNotifications = () => {
    const user = useUser();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        if (!user.data?.uid) return;

        try {
            const response = await getNotifications(user.data.uid);

            // Transform API data to match UI expectations
            // UI expects createdAt to have .toDate() method (Firestore Timestamp style)
            const transformedData = (response as any).map((item: any) => ({
                ...item,
                createdAt: item.createdAt ? { toDate: () => new Date(item.createdAt) } : null
            }));

            setNotifications(transformedData);
            setUnreadCount(transformedData.filter((n: Notification) => !n.isRead).length);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [user.data?.uid]);

    // Initial fetch + Polling every 60s
    useEffect(() => {
        if (!user.data?.uid) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        fetchNotifications();

        const interval = setInterval(fetchNotifications, 60000); // 60 seconds polling
        return () => clearInterval(interval);
    }, [user.data?.uid, fetchNotifications]);

    // Actions
    const markAsRead = async (notificationId: string) => {
        if (!user.data?.uid) return;

        // Optimistic Update
        setNotifications((prev) =>
            prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        try {
            await markNotificationRead(user.data.uid, notificationId);
        } catch (error) {
            console.error("Error marking as read:", error);
            // Revert on error if critical, but for read status usually ignore
        }
    };

    const markAllAsRead = async () => {
        if (!user.data?.uid || notifications.length === 0) return;

        const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
        if (unreadIds.length === 0) return;

        // Optimistic Update
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);

        // Process in background (serially or parallel)
        unreadIds.forEach(id => {
            markNotificationRead(user.data!.uid, id).catch(e => console.error(e));
        });
    };

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refetch: fetchNotifications
    };
};

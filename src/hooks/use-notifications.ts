import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@/lib/auth';
import { getNotifications, markNotificationRead } from '@/lib/api-client';
import { env } from '@/config/env';

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
    const wsRef = useRef<WebSocket | null>(null);

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

    // WebSocket Integration
    useEffect(() => {
        if (!user.data?.uid) return;
        const uid = user.data.uid; // Capture UID (safe string)
        let timeoutId: NodeJS.Timeout;

        const connectWebSocket = () => {
            const apiUrl = env.API_URL; // e.g., http://localhost:8000/api/v1
            const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
            const hostPath = apiUrl.replace(/^https?:\/\//, '');
            // Construct WS URL: ws://localhost:8000/api/v1/realtime/ws/updates/user.{uid}.notifications
            const wsUrl = `${wsProtocol}://${hostPath}/realtime/ws/updates/user.${uid}.notifications`;

            console.log('🔌 Connecting to Notification WebSocket:', wsUrl);
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('✅ WebSocket Connected');
            };

            ws.onmessage = (event) => {
                try {
                    const rawData = JSON.parse(event.data);
                    console.log('🔔 Realtime Notification Received:', rawData);

                    // Transform incoming data
                    const newNotification: Notification = {
                        ...rawData,
                        createdAt: rawData.createdAt ? { toDate: () => new Date(rawData.createdAt) } : { toDate: () => new Date() }
                    };

                    setNotifications(prev => {
                        // Avoid duplicates if possible (though backend should handle unique IDs)
                        if (prev.some(n => n.id === newNotification.id)) return prev;
                        return [newNotification, ...prev];
                    });
                    setUnreadCount(prev => prev + 1);

                } catch (e) {
                    console.error('❌ Error parsing websocket message:', e);
                }
            };

            ws.onclose = () => {
                console.log('🔌 WebSocket Disconnected, reconnecting in 5s...');
                timeoutId = setTimeout(() => {
                    // Only reconnect if the component is still mounted and user is same
                    // (But actually, if user changes, this effect cleans up and new one starts)
                    connectWebSocket();
                }, 5000);
            };

            wsRef.current = ws;
        };

        connectWebSocket();

        return () => {
            if (wsRef.current) {
                // Remove listener to prevent "onclose" triggering reconnect during cleanup
                wsRef.current.onclose = null;
                wsRef.current.close();
            }
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [user.data?.uid]);

    // Initial fetch + Polling (Fallback - 5 minutes)
    useEffect(() => {
        if (!user.data?.uid) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        fetchNotifications();

        const interval = setInterval(fetchNotifications, 300000); // 5 minutes fallback
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

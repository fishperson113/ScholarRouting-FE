import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useUser } from '@/lib/auth';
import { env } from '@/config/env';
import { useToast } from '@/hooks/use-toast';
import { getNotifications, markNotificationRead } from '@/lib/api-client';

// --- Types ---
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
    createdAt: any; // Firestore Timestamp or Date object
    link?: string;
    metadata?: {
        scholarshipId?: string;
        applicationId?: string;
        daysLeft?: number;
        [key: string]: any;
    };
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refetch: () => Promise<void>;
    isConnected: boolean;
}

// --- Context ---
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationContext must be used within a NotificationProvider');
    }
    return context;
};

// --- Provider ---
export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const user = useUser();
    const { toast } = useToast();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 1. Fetch Initial Notifications (REST API)
    const fetchNotifications = useCallback(async () => {
        if (!user.data?.uid) return;

        try {
            setLoading(true);
            const response = await getNotifications(user.data.uid);

            // Transform Data: Ensure createdAt is usable
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

    // 2. WebSocket Connection Logic (The "Guard")
    useEffect(() => {
        if (!user.data?.uid) return;

        const uid = user.data.uid;

        const connectWebSocket = () => {
            // Prevent multiple connections
            if (wsRef.current?.readyState === WebSocket.OPEN) return;

            const apiUrl = env.API_URL;
            const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
            const hostPath = apiUrl.replace(/^https?:\/\//, '');
            const wsUrl = `${wsProtocol}://${hostPath}/realtime/ws/updates/user.${uid}.notifications`;

            console.log('🔌 [NotificationProvider] Connecting WS:', wsUrl);
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('✅ [NotificationProvider] Connected');
                setIsConnected(true);
                // Clear reconnect timeout if successful
                if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            };

            ws.onmessage = (event) => {
                try {
                    const rawData = JSON.parse(event.data);
                    console.log('🔔 [NotificationProvider] Received:', rawData);

                    // Create new notification object
                    const newNotification: Notification = {
                        ...rawData,
                        createdAt: rawData.createdAt
                            ? { toDate: () => new Date(rawData.createdAt) }
                            : { toDate: () => new Date() }
                    };

                    // Update State Immediately (Real-time!)
                    setNotifications(prev => {
                        // Prevent duplicates
                        if (prev.some(n => n.id === newNotification.id)) return prev;
                        return [newNotification, ...prev];
                    });

                    setUnreadCount(prev => prev + 1);

                    // Show Toast (Optional UX enhancement)
                    toast('info', {
                        title: newNotification.title,
                        message: newNotification.message,
                    });

                } catch (e) {
                    console.error('❌ [NotificationProvider] Parse Error:', e);
                }
            };

            ws.onclose = () => {
                console.log('🔌 [NotificationProvider] Disconnected');
                setIsConnected(false);
                wsRef.current = null;

                // Auto-reconnect after 3s
                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log('🔄 [NotificationProvider] Attempting Reconnect...');
                    connectWebSocket();
                }, 3000);
            };

            ws.onerror = (error) => {
                console.error('❌ [NotificationProvider] Error:', error);
                ws.close();
            };

            wsRef.current = ws;
        };

        // Start fetching & connect
        fetchNotifications();
        connectWebSocket();

        // Cleanup
        return () => {
            if (wsRef.current) {
                wsRef.current.onclose = null; // Prevent reconnect loop on unmount
                wsRef.current.close();
            }
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        };
    }, [user.data?.uid, fetchNotifications, toast]);


    // 3. Actions
    const markAsRead = async (id: string) => {
        // Optimistic Update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        // API Call
        if (user.data?.uid) {
            await markNotificationRead(user.data.uid, id).catch(console.error);
        }
    };

    const markAllAsRead = async () => {
        if (unreadCount === 0) return;

        // Optimistic Update
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);

        // API Call (Ideally should represent a bulk update endpoint, but looping for now)
        if (user.data?.uid) {
            const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
            unreadIds.forEach(id => markNotificationRead(user.data!.uid, id));
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            markAsRead,
            markAllAsRead,
            refetch: fetchNotifications,
            isConnected
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

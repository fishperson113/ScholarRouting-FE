
import { useState, useEffect } from 'react';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    writeBatch,
    addDoc,
    serverTimestamp,
    limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/lib/auth';

export type NotificationType =
    | 'DEADLINE_WARNING'
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
    createdAt: any; // Firestore Timestamp
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

    useEffect(() => {
        if (!user.data?.uid) {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
            return;
        }

        const userId = user.data.uid;

        // Query notifications for current user, ordered by time
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(20) // Limit to last 20 notifications for performance
        );

        // Real-time listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs: Notification[] = [];
            let count = 0;

            snapshot.forEach((doc) => {
                const data = doc.data() as Omit<Notification, 'id'>;
                if (!data.isRead) count++;
                notifs.push({
                    id: doc.id,
                    ...data,
                });
            });

            setNotifications(notifs);
            setUnreadCount(count);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching notifications:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user.data?.uid]);

    // Actions
    const markAsRead = async (notificationId: string) => {
        if (!user.data?.uid) return;
        try {
            const notifRef = doc(db, 'notifications', notificationId);
            await updateDoc(notifRef, { isRead: true });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        if (!user.data?.uid || notifications.length === 0) return;

        const batch = writeBatch(db);
        const unreadNotifs = notifications.filter(n => !n.isRead);

        if (unreadNotifs.length === 0) return;

        unreadNotifs.forEach(notif => {
            const notifRef = doc(db, 'notifications', notif.id);
            batch.update(notifRef, { isRead: true });
        });

        try {
            await batch.commit();
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    // Helper function to send a test notification (Development only)
    const sendTestNotification = async () => {
        if (!user.data?.uid) return;

        try {
            await addDoc(collection(db, 'notifications'), {
                userId: user.data.uid,
                type: 'DEADLINE_WARNING',
                title: 'Sắp hết hạn nộp hồ sơ!',
                message: 'Học bổng Erasmus Mundus sẽ đóng đơn trong 3 ngày nữa.',
                isRead: false,
                createdAt: serverTimestamp(),
                link: '/app/applications',
                metadata: {
                    daysLeft: 3
                }
            });
        } catch (error) {
            console.error("Error sending test notification:", error);
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        sendTestNotification
    };
};

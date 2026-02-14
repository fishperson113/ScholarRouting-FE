
import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Bell, Check, Clock, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import { useNotifications, NotificationType, Notification } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility

// Extend dayjs
dayjs.extend(relativeTime);

const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case 'DEADLINE_WARNING':
            return <Clock className="h-5 w-5 text-amber-500" />;
        case 'DEADLINE_MISSED':
            return <Clock className="h-5 w-5 text-red-500" />;
        case 'APPLICATION_STATUS':
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'SCHOLARSHIP_MATCH':
            return <Info className="h-5 w-5 text-blue-500" />;
        case 'SYSTEM_ALERT':
            return <AlertTriangle className="h-5 w-5 text-red-500" />;
        default:
            return <Bell className="h-5 w-5 text-gray-500" />;
    }
};

const getNotificationColor = (type: NotificationType) => {
    switch (type) {
        case 'DEADLINE_WARNING':
            return 'bg-amber-50';
        case 'DEADLINE_MISSED':
            return 'bg-red-50';
        case 'APPLICATION_STATUS':
            return 'bg-green-50';
        case 'SCHOLARSHIP_MATCH':
            return 'bg-blue-50';
        case 'SYSTEM_ALERT':
            return 'bg-red-50';
        default:
            return 'bg-gray-50';
    }
};

export const NotificationDropdown = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNotificationClick = (notif: Notification) => {
        // Mark as read
        if (!notif.isRead) {
            markAsRead(notif.id);
        }

        // Navigate if link exists
        if (notif.link) {
            navigate(notif.link);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-purple-100"
            >
                <Bell className={cn("w-5 h-5", isOpen && "text-purple-600")} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-in zoom-in">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Content */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 origin-top-right">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-white">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllAsRead()}
                                className="text-xs text-purple-600 hover:text-purple-700 font-medium hover:underline flex items-center"
                            >
                                <Check className="w-3 h-3 mr-1" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        {notifications.length === 0 ? (
                            <div className="py-12 px-4 text-center">
                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Bell className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-500 text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={cn(
                                            "group px-4 py-3 cursor-pointer transition-colors relative",
                                            notif.isRead ? "bg-white hover:bg-gray-50" : "bg-purple-50/40 hover:bg-purple-50/70"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex gap-3",
                                            // Center align vertically if it's a deadline notification (no title), otherwise align top
                                            ['DEADLINE_WARNING', 'DEADLINE_MISSED'].includes(notif.type) ? "items-center" : "items-start"
                                        )}>
                                            {/* Icon */}
                                            <div className={cn(
                                                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                                                getNotificationColor(notif.type)
                                            )}>
                                                {getNotificationIcon(notif.type)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    {/* Hide title for Deadline notifications, show for others */}
                                                    {!['DEADLINE_WARNING', 'DEADLINE_MISSED'].includes(notif.type) && (
                                                        <p className={cn(
                                                            "text-sm font-medium pr-2 truncate",
                                                            notif.isRead ? "text-gray-700" : "text-gray-900"
                                                        )}>
                                                            {notif.title}
                                                        </p>
                                                    )}

                                                    {/* Timestamp (top right) - Hide for deadline notifs */}
                                                    {!['DEADLINE_WARNING', 'DEADLINE_MISSED'].includes(notif.type) && (
                                                        <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                                                            {notif.createdAt ? dayjs(notif.createdAt?.toDate()).fromNow() : 'Just now'}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Message becomes the main content */}
                                                <p className={cn(
                                                    "leading-relaxed",
                                                    ['DEADLINE_WARNING', 'DEADLINE_MISSED'].includes(notif.type)
                                                        ? (notif.isRead ? "text-[13px] text-gray-700 font-normal" : "text-[13px] text-gray-900 font-medium")
                                                        : "text-xs text-gray-500 mt-0.5 line-clamp-2"
                                                )}>
                                                    {notif.message}
                                                </p>

                                                {/* Timestamp MOVED to bottom RIGHT for deadline notifs */}
                                                {['DEADLINE_WARNING', 'DEADLINE_MISSED'].includes(notif.type) && (
                                                    <p className="text-[10px] text-gray-400 mt-1 text-right">
                                                        {notif.createdAt ? dayjs(notif.createdAt?.toDate()).fromNow() : 'Just now'}
                                                    </p>
                                                )}

                                                {/* Custom content for Deadline (Expiring badge) removed/integrated */}
                                                {notif.type === 'DEADLINE_WARNING' && notif.metadata?.daysLeft && (
                                                    // Optional: Keep the badge if you like, or remove it since message is clear now
                                                    <div className="mt-1 hidden"></div>
                                                )}
                                            </div>

                                            {/* Unread Indicator Dot */}
                                            {!notif.isRead && (
                                                <div className="absolute top-1/2 right-3 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full shadow-sm"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer - REMOVED per user request */}
                    {/* {notifications.length > 0 && (
                        <div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
                            <Link to="/app/notifications" className="text-xs font-medium text-gray-500 hover:text-purple-600">
                                View all notifications
                            </Link>
                        </div>
                    )} */}
                </div>
            )}
        </div>
    );
};

import { Info, CircleAlert, CircleX, CircleCheck, X } from 'lucide-react';
import { useEffect } from 'react';

const config = {
  info: {
    icon: <Info className="size-5 text-white" aria-hidden="true" />,
    bgColor: 'bg-blue-500',
    borderColor: 'border-l-blue-500',
  },
  success: {
    icon: <CircleCheck className="size-5 text-white" aria-hidden="true" />,
    bgColor: 'bg-green-500',
    borderColor: 'border-l-green-500',
  },
  warning: {
    icon: <CircleAlert className="size-5 text-white" aria-hidden="true" />,
    bgColor: 'bg-yellow-500',
    borderColor: 'border-l-yellow-500',
  },
  error: {
    icon: <CircleX className="size-5 text-white" aria-hidden="true" />,
    bgColor: 'bg-red-500',
    borderColor: 'border-l-red-500',
  },
};

export type NotificationProps = {
  notification: {
    id: string;
    type: keyof typeof config;
    title: string;
    message?: string;
  };
  onDismiss: (id: string) => void;
};

export const Notification = ({
  notification: { id, type, title, message },
  onDismiss,
}: NotificationProps) => {
  const { icon, bgColor, borderColor } = config[type];

  // Auto dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <div className="flex w-full flex-col items-start space-y-4">
      <div
        className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg border-l-4 ${borderColor} animate-in slide-in-from-left duration-300`}
        role="alert"
        aria-label={title}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon Circle */}
            <div className={`flex-shrink-0 ${bgColor} rounded-full p-1.5 flex items-center justify-center`}>
              {icon}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{title}</p>
              {message && (
                <p className="mt-1 text-sm text-gray-600">{message}</p>
              )}
            </div>
            
            {/* Close Button */}
            <button
              className="flex-shrink-0 inline-flex rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
              onClick={() => onDismiss(id)}
              aria-label="Close notification"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

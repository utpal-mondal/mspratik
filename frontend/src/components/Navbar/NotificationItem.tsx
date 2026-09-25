import { Package, CheckCircle, XCircle, Clock } from 'lucide-react';

export interface Notification {
  id: number;
  type: 'new_transfer' | 'approved' | 'rejected' | 'received';
  title: string;
  product_name: string;
  quantity: number;
  message: string;
  warehouse?: string;
  transfer_id: number;
  is_read: boolean;
  created_at: string;
}

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
}

const getIcon = (type: Notification['type']) => {
  switch (type) {
    case 'approved':
      return <CheckCircle size={15} />;
    case 'rejected':
      return <XCircle size={15} />;
    case 'received':
      return <CheckCircle size={15} />;
    default:
      return <Package size={15} />;
  }
};

const getIconStyle = (type: Notification['type']) => {
  switch (type) {
    case 'approved':
      return 'bg-green-50 text-green-600';
    case 'rejected':
      return 'bg-red-50 text-red-600';
    case 'received':
      return 'bg-blue-50 text-blue-600';
    default:
      return 'bg-orange-50 text-orange-600';
  }
};

const formatTime = (date: string) => {
  const now = new Date();
  const created = new Date(date);

  const diffInMinutes = Math.floor(
    (now.getTime() - created.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  return `${Math.floor(diffInHours / 24)} days ago`;
};

export default function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 transition-colors hover:bg-gray-50 border-b border-gray-100 ${
        !notification.is_read ? 'bg-blue-50/30' : 'bg-white'
      }`}
    >
      <div className="flex gap-2.5">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${getIconStyle(
            notification.type
          )}`}
        >
          {getIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[13px] font-semibold text-gray-900 leading-tight mb-2">
              {notification.title}
            </p>

            {!notification.is_read && (
              <span className="mt-1 w-1.5 h-1.5 flex-shrink-0 rounded-full bg-blue-600" />
            )}
          </div>

          <p className="mt-0.5 text-[12px] text-gray-700 leading-snug mb-1">
            <span className="font-semibold">
              {notification.quantity} pcs {notification.product_name}
            </span>{' '}
            {notification.message}
          </p>

          {notification.warehouse && (
            <p className="text-xs text-gray-500 leading-snug mb-2">
              {notification.warehouse}
            </p>
          )}

          <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
            <Clock size={11} />
            <span>{formatTime(notification.created_at)}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

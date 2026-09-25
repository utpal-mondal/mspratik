import { Bell, ArrowRight } from 'lucide-react';
import NotificationItem, {
  Notification,
} from './NotificationItem';

interface NotificationDropdownProps {
  onClose: () => void;
}

const dummyNotifications: Notification[] = [
  {
    id: 101,
    type: 'new_transfer',
    title: 'New Stock Transfer',
    product_name: 'iPhone 15',
    quantity: 100,
    message: 'received from',
    warehouse: 'Kolkata Warehouse',
    transfer_id: 5001,
    is_read: false,
    created_at: '2026-09-04T14:48:00',
  },
  {
    id: 102,
    type: 'approved',
    title: 'Transfer Approved',
    product_name: 'Samsung Phones',
    quantity: 50,
    message: 'transfer approved',
    transfer_id: 5002,
    is_read: false,
    created_at: '2026-09-04T14:40:00',
  },
  {
    id: 103,
    type: 'received',
    title: 'Stock Transfer Received',
    product_name: 'Dell Laptop',
    quantity: 20,
    message: 'received from',
    warehouse: 'Delhi Warehouse',
    transfer_id: 5003,
    is_read: true,
    created_at: '2026-09-04T13:55:00',
  },
  {
    id: 104,
    type: 'rejected',
    title: 'Transfer Rejected',
    product_name: 'HP Monitor',
    quantity: 10,
    message: 'transfer rejected',
    transfer_id: 5004,
    is_read: true,
    created_at: '2026-09-04T13:20:00',
  },
];

export default function NotificationDropdown({
  onClose,
}: NotificationDropdownProps) {
  const unreadCount = dummyNotifications.filter(
    (notification) => !notification.is_read
  ).length;

  const handleNotificationClick = (notification: Notification) => {
    console.log('Notification clicked:', notification);

    // Later:
    // router.push(`/stock-transfer/${notification.transfer_id}`);

    onClose();
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-[340px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-gray-600" />

          <h3 className="text-sm font-semibold text-gray-900">
            Notifications
          </h3>

          {unreadCount > 0 && (
            <span className="rounded-full bg-red-500 px-1.5 py-0 text-[10px] font-semibold text-white min-w-[18px] flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>

        <button
          type="button"
          className="text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          Mark all read
        </button>
      </div>

      {/* Notifications */}
      <div className="max-h-[360px] overflow-y-auto">
        {dummyNotifications.length > 0 ? (
          dummyNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={() => handleNotificationClick(notification)}
            />
          ))
        ) : (
          <div className="px-6 py-8 text-center">
            <Bell
              size={24}
              className="mx-auto text-gray-300"
            />

            <p className="mt-2 text-xs text-gray-500">
              No notifications
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 bg-gray-50">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-blue-600 hover:bg-gray-100 transition-colors"
        >
          View All Notifications
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

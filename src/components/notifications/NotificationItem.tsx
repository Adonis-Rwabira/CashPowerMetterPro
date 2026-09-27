import React from 'react';
import { AlertTriangle, Info, BellRing, type LucideProps } from 'lucide-react';

export type NotificationType = 'warning' | 'critical' | 'info';

interface NotificationItemProps {
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
}

const notificationConfig: Record<NotificationType, { icon: React.FC<LucideProps>, color: string }> = {
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-400',
  },
  critical: {
    icon: BellRing,
    color: 'text-red-400',
  },
  info: {
    icon: Info,
    color: 'text-primary',
  },
};

const NotificationItem: React.FC<NotificationItemProps> = ({ type, title, message, timestamp }) => {
  const { icon: Icon, color } = notificationConfig[type];

  return (
    <div className="flex items-start gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant w-full">
      <div className={`mt-1 ${color}`}>
        <Icon size={20} strokeWidth={2} />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-on-surface">{title}</h3>
        <p className="text-sm text-on-surface-variant mt-1">{message}</p>
        <span className="text-xs text-outline mt-2 block">{timestamp}</span>
      </div>
    </div>
  );
};

export default NotificationItem;

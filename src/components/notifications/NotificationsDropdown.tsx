
import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { getLatestNotifications } from '../../db/repositories';
import { Link } from 'react-router-dom';
import { Bell, AlertTriangle, Info } from 'lucide-react';
import { NotificationEntity } from '../../db/database';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const NotificationIcon = ({ type }: { type: NotificationEntity['type'] }) => {
  switch (type) {
    case 'critical':
      return <AlertTriangle className="w-5 h-5 text-error" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-secondary" />;
    default:
      return <Info className="w-5 h-5 text-tertiary" />;
  }
};

const NotificationsDropdown: React.FC = () => {
  const latestNotifications = useLiveQuery(() => getLatestNotifications(3), []);

  return (
    <div className="w-full rounded-2xl bg-surface-container-high shadow-xl border-outline-variant overflow-hidden">
      <div className="px-4 py-3 border-b border-outline-variant">
        <h3 className="font-bold text-on-surface">Notifications</h3>
      </div>
      <div className="flex flex-col">
        {latestNotifications && latestNotifications.length > 0 ? (
          latestNotifications.map((notif) => (
            <Link 
              to={`/dashboard?meter=${notif.meter_id}`}
              key={notif.id} 
              className="flex items-start gap-4 px-4 py-3 transition-colors hover:bg-surface-container"
            >
              <NotificationIcon type={notif.type} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-on-surface">{notif.title}</p>
                <p className="text-xs text-on-surface-variant">{notif.message}</p>
                <p className="text-xs text-on-surface-variant/70 mt-1">
                  {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true, locale: fr })}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Bell size={32} className="text-on-surface-variant/50" />
            <p className="mt-4 text-sm font-semibold text-on-surface-variant">Aucune nouvelle notification</p>
            <p className="mt-1 text-xs text-on-surface-variant/80">Tout est en ordre.</p>
          </div>
        )}
      </div>
      {latestNotifications && latestNotifications.length > 0 && (
        <Link to="/notifications" className="block text-center px-4 py-3 bg-surface-container text-sm font-bold text-primary hover:bg-primary/10 transition-colors">
          Voir toutes les notifications
        </Link>
      )}
    </div>
  );
};

export default NotificationsDropdown;

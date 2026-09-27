import React from 'react';
import NotificationItem from '../components/notifications/NotificationItem';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { AlertCircle } from 'lucide-react';
import { formatDistanceToNow, Locale } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { fr, enUS } from 'date-fns/locale';

const localeMap: { [key: string]: Locale } = {
  fr: fr,
  en: enUS,
  sw: fr,
};

const NotificationsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLocale = localeMap[i18n.language] || enUS;

  const notifications = useLiveQuery(() => 
    db.notifications.orderBy('timestamp').reverse().toArray()
  , []);

  return (
    <div className="w-full flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight text-on-surface px-1">{t('notificationsPage.title')}</h1>
      
      {notifications && notifications.length > 0 ? (
        <div className="flex flex-col gap-3">
          {notifications.map((notification) => (
            <NotificationItem 
                key={notification.id} 
                type={notification.type}
                title={notification.title}
                message={notification.message}
                timestamp={formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: currentLocale })}
            />
          ))}
        </div>
      ) : (
        <div className="w-full h-64 flex flex-col items-center justify-center text-center gap-4 text-on-surface-variant p-4 bg-surface-container-low rounded-xl border border-outline-variant">
            <AlertCircle size={40} className="text-outline"/>
            <p className="max-w-md">
              {t('notificationsPage.noNotifications')}
            </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
